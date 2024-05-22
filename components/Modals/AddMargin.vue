<script lang="ts" setup>
import {
  Status,
  StatusType,
  BigNumberInWei,
  BigNumberInBase
} from '@injectivelabs/utils'
import { ZERO_IN_BASE } from '@shared/utils/constant'
import { Position, PositionV2 } from '@injectivelabs/sdk-ts'
import { UI_DEFAULT_PRICE_DISPLAY_DECIMALS } from '@/app/utils/constants'
import { Modal } from '@/types'

const props = defineProps({
  position: {
    type: Object as PropType<Position | PositionV2 | undefined>,
    default: undefined
  }
})

const modalStore = useModalStore()
const positionStore = usePositionStore()
const derivativeStore = useDerivativeStore()
const { t } = useLang()
const { $onError } = useNuxtApp()
const { success } = useNotifications()
const { handleSubmit, resetForm } = useForm()
const { userBalancesWithToken } = useBalance()

const status = reactive(new Status(StatusType.Idle))

const isModalOpen = computed(
  () => modalStore.modals[Modal.AddMarginToPosition] && !!props.position
)

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

  const quoteBalance = userBalancesWithToken.value.find(
    (balance) => balance.denom === market.value?.quoteDenom
  )

  return new BigNumberInWei(quoteBalance?.availableMargin || '0').toBase(
    market.value.quoteToken.decimals
  )
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

  status.setLoading()

  positionStore
    .addMarginToPosition({
      market: market.value,
      amount: new BigNumberInBase(amountValue.value)
    })
    .then(() => {
      resetForm()
      success({ title: t('trade.success_added_margin') })
      onModalClose()
    })
    .catch($onError)
    .finally(() => {
      status.setIdle()
    })
})
</script>

<template>
  <AppModal :is-open="isModalOpen" is-sm @modal:closed="onModalClose">
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
              <p class="uppercase text-xs font-semibold text-gray-200">
                {{ $t('trade.availableMargin') }}
              </p>
              <AppTooltip
                class="ml-2 text-gray-200"
                :content="$t('trade.availableMarginTooltip')"
              />
            </div>
            <div class="mt-4 text-center">
              <span
                class="font-mono flex items-center justify-center text-gray-200 text-base lg:text-xl"
                data-cy="add-margin-modal-available-text-content"
              >
                {{ availableMarginToString }}
                <span class="text-gray-500 ml-2">{{
                  market.quoteToken.symbol
                }}</span>
              </span>
            </div>
          </div>

          <div class="mt-4">
            <div class="flex flex-wrap">
              <div class="w-full">
                <AppInputField
                  v-model="amountValue"
                  :label="$t('trade.amount')"
                  :max="Number(availableMarginToString)"
                  autofix
                  :placeholder="$t('trade.enter_your_amount')"
                  class="no-shadow"
                  data-cy="add-margin-modal-amount-input"
                  :decimals="4"
                >
                  <template #max>
                    <AppButton
                      is-xs
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
                  is-lg
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
