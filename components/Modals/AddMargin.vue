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
import { BusEvents, Modal } from '@/types'

const modalStore = useModalStore()
const positionStore = usePositionStore()
const derivativeStore = useDerivativeStore()
const { t } = useLang()
const { $onError } = useNuxtApp()
const { success } = useNotifications()
const { handleSubmit, resetForm } = useForm()
const { userBalancesWithToken } = useBalance()

const status = reactive(new Status(StatusType.Idle))
const position = ref<Position | PositionV2 | undefined>(undefined)

const isModalOpen = computed(
  () => modalStore.modals[Modal.AddMarginToPosition] && !!position.value
)

const market = computed(() => {
  if (!position.value) {
    return
  }

  return derivativeStore.markets.find(
    (market) => market.marketId === position.value?.marketId
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

onMounted(() => {
  // todo: refactor this to pass position from parent component
  useEventBus<Position>(BusEvents.AddMarginToPosition).on(
    (p) => (position.value = p)
  )
})

const {
  valueToBigNumber: availableMargin,
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
  position.value = undefined

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
                <AppInputNumeric
                  v-model="amountValue"
                  :label="$t('trade.amount')"
                  :max="availableMarginToString"
                  :max-selector="availableMargin.gt(0.01)"
                  :placeholder="$t('trade.enter_your_amount')"
                  :errors="status.isLoading() ? [] : amountErrors"
                  class="no-shadow"
                  step="0.001"
                  data-cy="add-margin-modal-amount-input"
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
                </AppInputNumeric>

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
                  :is-loading="status.isLoading()"
                  :is-disabled="amountErrors.length > 0"
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
