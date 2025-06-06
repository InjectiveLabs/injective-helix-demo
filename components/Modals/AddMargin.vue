<script lang="ts" setup>
import { PositionV2 } from '@injectivelabs/sdk-ts'
import { ZERO_IN_BASE } from '@shared/utils/constant'
import { sharedToBalanceInToken } from '@shared/utils/formatter'
import { Status, StatusType, BigNumberInBase } from '@injectivelabs/utils'
import { UI_DEFAULT_PRICE_DISPLAY_DECIMALS } from '@/app/utils/constants'
import { Modal } from '@/types'

const props = withDefaults(
  defineProps<{
    position: PositionV2
    isPgt?: boolean
  }>(),
  {
    isPgt: false
  }
)

const modalStore = useSharedModalStore()
const positionStore = usePositionStore()
const derivativeStore = useDerivativeStore()
const sharedWalletStore = useSharedWalletStore()
const { t } = useLang()
const { $onError } = useNuxtApp()
const notificationStore = useSharedNotificationStore()
const { handleSubmit, resetForm } = useForm()
const { activeSubaccountBalancesWithToken } = useBalance()

const status = reactive(new Status(StatusType.Idle))

const market = computed(() => {
  if (!props.position) {
    return
  }

  return derivativeStore.markets.find(
    (market) => market.marketId === props.position?.marketId
  )
})

const quoteBalance = computed(() => {
  if (!market.value) {
    return ZERO_IN_BASE
  }

  const quoteBalance = activeSubaccountBalancesWithToken.value.find(
    (balance) => balance.denom === market.value?.quoteDenom
  )

  return sharedToBalanceInToken({
    value: quoteBalance?.availableBalance || '0',
    decimalPlaces: market.value.quoteToken.decimals
  })
})

const {
  valueToFixed: availableMarginToFixed,
  valueToString: availableMarginToString
} = useSharedBigNumberFormatter(quoteBalance, {
  decimalPlaces: UI_DEFAULT_PRICE_DISPLAY_DECIMALS
})

const {
  value: amountValue,
  errors: amountErrors,
  setValue: setAmountValue
} = useStringField({
  name: 'amount',
  rule: 'required|positiveNumber',
  dynamicRule: computed(() => `between:0.001,${availableMarginToFixed.value}`)
})

function onMaxClicked() {
  setAmountValue(availableMarginToFixed.value)
}

function onModalClose() {
  modalStore.closeModal(Modal.AddMarginToPosition)
}

const onSubmit = handleSubmit(() => {
  if (!market.value) {
    return
  }

  if (props.isPgt && sharedWalletStore.defaultSubaccountId) {
    status.setLoading()

    positionStore
      .addMarginToSubaccountPosition({
        market: market.value,
        amount: new BigNumberInBase(amountValue.value),
        fromSubaccountId: sharedWalletStore.defaultSubaccountId,
        toSubaccountId: props.position.subaccountId
      })
      .then(() => {
        resetForm()
        notificationStore.success({ title: t('trade.success_added_margin') })
        onModalClose()
      })
      .catch($onError)
      .finally(() => {
        status.setIdle()
      })
    return
  }

  status.setLoading()

  positionStore
    .addMarginToPosition({
      market: market.value,
      amount: new BigNumberInBase(amountValue.value)
    })
    .then(() => {
      resetForm()
      notificationStore.success({ title: t('trade.success_added_margin') })
      onModalClose()
    })
    .catch($onError)
    .finally(() => {
      status.setIdle()
    })
})
</script>

<template>
  <AppModal v-model="modalStore.modals[Modal.AddMarginToPosition]">
    <template #title>
      <h3>
        {{ $t('trade.add_margin_to_position_title') }}
      </h3>
    </template>

    <div v-if="market && quoteBalance" class="relative">
      <div class="flex flex-wrap">
        <div class="px-4 w-full">
          <div class="text-center">
            <div class="flex items-center justify-center">
              <p class="uppercase text-xs font-semibold text-coolGray-200">
                {{ $t('trade.availableMargin') }}
              </p>
              <AppTooltip
                class="ml-2 text-coolGray-200"
                :content="$t('trade.availableMarginTooltip')"
              />
            </div>
            <div class="mt-4 text-center">
              <span
                class="flex items-center justify-center text-coolGray-200 text-base lg:text-xl"
                data-cy="add-margin-modal-available-text-content"
              >
                {{ availableMarginToString }}
                <PartialsCommonBalanceDisplay
                  v-bind="{
                    token: market.quoteToken,
                    value: market.quoteToken.symbol,
                    textColorClass: 'text-cool-gray-500 ml-2'
                  }"
                />
              </span>
            </div>
          </div>

          <div class="mt-4">
            <div class="flex flex-wrap">
              <div class="w-full">
                <AppInputField
                  v-model="amountValue"
                  :label="$t('trade.amount')"
                  :max="Number(availableMarginToFixed)"
                  autofix
                  :placeholder="$t('trade.enter_your_amount')"
                  class="no-shadow"
                  data-cy="add-margin-modal-amount-input"
                  :decimals="4"
                >
                  <template #max>
                    <AppButton
                      size="xs"
                      class="bg-blue-500 text-blue-900"
                      @click="onMaxClicked"
                    >
                      {{ $t('trade.max') }}
                    </AppButton>
                  </template>

                  <template #addon>
                    {{ market.quoteToken.symbol }}
                  </template>
                </AppInputField>

                <p
                  v-if="amountErrors.length > 0"
                  class="capitalize-phrase text-red-500 text-sm mt-2"
                >
                  {{ amountErrors[0] }}
                </p>
              </div>
              <div class="w-full mt-6 text-center">
                <AppButton
                  size="lg"
                  class="w-full bg-blue-500 text-blue-900"
                  v-bind="{ status }"
                  :disabled="amountErrors.length > 0"
                  data-cy="add-margin-modal-execute-button"
                  @click="onSubmit"
                >
                  {{ $t('trade.add_margin') }}
                </AppButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </AppModal>
</template>
