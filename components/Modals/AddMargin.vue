<script lang="ts" setup>
import {
  Status,
  StatusType,
  BigNumberInWei,
  BigNumberInBase
} from '@injectivelabs/utils'
import { UiPosition, ZERO_IN_BASE } from '@injectivelabs/sdk-ui-ts'
import { BusEvents, Modal } from '@/types'
import { UI_DEFAULT_PRICE_DISPLAY_DECIMALS } from '@/app/utils/constants'

const modalStore = useModalStore()
const accountStore = useAccountStore()
const positionStore = usePositionStore()
const derivativeStore = useDerivativeStore()
const { t } = useLang()
const { success } = useNotifications()
const { $onError } = useNuxtApp()
const { handleSubmit, resetForm } = useForm()

const status = reactive(new Status(StatusType.Idle))
const position = ref<UiPosition | undefined>(undefined)

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
  if (!market.value || !accountStore.subaccount) {
    return ZERO_IN_BASE
  }

  const quoteToken = market.value.quoteToken

  const balance = accountStore.subaccount.balances.find(
    (balance) => balance.denom.toLowerCase() === quoteToken.denom.toLowerCase()
  )

  if (!balance) {
    return ZERO_IN_BASE
  }

  return new BigNumberInWei(balance.availableBalance || 0).toBase(
    quoteToken.decimals
  )
})

onMounted(() => {
  // todo: refactor this to pass position from parent component
  useEventBus<UiPosition>(BusEvents.AddMarginToPosition).on(
    (p) => (position.value = p)
  )
})

const {
  valueToBigNumber: availableMargin,
  valueToFixed: availableMarginToFixed,
  valueToString: availableMarginToString
} = useBigNumberFormatter(quoteBalance, {
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

function handleMax() {
  setAmountValue(availableMarginToFixed.value)
}

function handleModalClose() {
  position.value = undefined

  modalStore.closeModal(Modal.AddMarginToPosition)
}

const handleFormSubmit = handleSubmit(() => {
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
      handleModalClose()
    })
    .catch($onError)
    .finally(() => {
      status.setIdle()
    })
})
</script>

<template>
  <AppModal :show="isModalOpen" sm @modal:closed="handleModalClose">
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
              <CommonInfoTooltip
                class="ml-2 text-gray-200"
                :tooltip="$t('trade.availableMarginTooltip')"
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
                      xs
                      class="bg-blue-500 text-blue-900"
                      @click="handleMax"
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
                  lg
                  class="w-full bg-blue-500 text-blue-900"
                  :status="status"
                  :disabled="amountErrors.length > 0"
                  data-cy="add-margin-modal-execute-button"
                  @click="handleFormSubmit"
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
