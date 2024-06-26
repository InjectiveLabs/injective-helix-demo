<script lang="ts" setup>
import { BigNumberInBase } from '@injectivelabs/utils'
import { UI_DEFAULT_MIN_DISPLAY_DECIMALS } from '@/app/utils/constants'
import {
  Modal,
  MarketKey,
  UiDerivativeMarket,
  DerivativeTradeTypes,
  DerivativesTradeFormField
} from '@/types'

const modalStore = useModalStore()
const derivativeFormValues = useFormValues()

const derivativeMarket = inject(MarketKey) as Ref<UiDerivativeMarket>

const props = defineProps({
  worstPrice: {
    type: String,
    required: true
  }
})

const emit = defineEmits<{
  'terms:agreed': []
}>()

const { marketMarkPrice } = useDerivativeLastPrice(
  computed(() => derivativeMarket?.value)
)

const executionPrice = computed(() => {
  switch (derivativeFormValues.value[DerivativesTradeFormField.Type]) {
    case DerivativeTradeTypes.Limit:
      return (
        derivativeFormValues.value[DerivativesTradeFormField.LimitPrice] || ''
      )
    case DerivativeTradeTypes.Market:
      return props.worstPrice
    case DerivativeTradeTypes.StopLimit:
      return (
        derivativeFormValues.value[DerivativesTradeFormField.LimitPrice] || ''
      )
    case DerivativeTradeTypes.StopMarket:
      return (
        derivativeFormValues.value[DerivativesTradeFormField.TriggerPrice] || ''
      )
    default:
      return props.worstPrice
  }
})

const { valueToString: executionPriceToString } = useSharedBigNumberFormatter(
  computed(() => executionPrice.value),
  {
    decimalPlaces: UI_DEFAULT_MIN_DISPLAY_DECIMALS,
    displayAbsoluteDecimalPlace: true
  }
)

const { valueToString: markPriceToString } = useSharedBigNumberFormatter(
  computed(() => marketMarkPrice.value),
  {
    decimalPlaces: UI_DEFAULT_MIN_DISPLAY_DECIMALS,
    displayAbsoluteDecimalPlace: true
  }
)

const { valueToString: priceDeviationToString } = useSharedBigNumberFormatter(
  computed(() => {
    const numerator = new BigNumberInBase(executionPrice.value).minus(
      marketMarkPrice.value
    )
    const denominator = marketMarkPrice.value

    return Math.abs(numerator.div(denominator).toNumber()) * 100
  }),
  {
    decimalPlaces: UI_DEFAULT_MIN_DISPLAY_DECIMALS,
    displayAbsoluteDecimalPlace: true
  }
)

function closeModal() {
  modalStore.closeModal(Modal.ClosedRWAMarket)
}

function confirm() {
  emit('terms:agreed')
  closeModal()
}
</script>

<template>
  <AppModal
    :is-open="modalStore.modals[Modal.ClosedRWAMarket]"
    is-sm
    @modal:closed="closeModal"
  >
    <template #title>
      <div class="text-orange-300 flex space-x-1 items-center justif-center">
        <SharedIcon name="warning-triangle" is-md />
        <h3 class="normal-case text-lg">
          {{ $t('trade.rwa.warning') }}
        </h3>
      </div>
    </template>

    <div class="relative">
      <div class="flex flex-col gap-4">
        <p>
          {{ $t('trade.rwa.marketIsClosed') }}
        </p>

        <i18n-t keypath="trade.rwa.marketClosedTrade" tag="p">
          <template #marketClosedTimes>
            <NuxtLink
              class="opacity-75 cursor-pointer text-blue-500 hover:opacity-50"
              to="https://docs.pyth.network/price-feeds/market-hours"
              target="_blank"
            >
              {{ $t('trade.rwa.marketClosedTimes') }}
            </NuxtLink>
          </template>
        </i18n-t>

        <div class="flex flex-col space-y-2">
          <div class="flex">
            <span class="flex-1 text-left">{{
              $t('trade.previousMarkPrice')
            }}</span>
            <span class="flex-1 text-left">
              {{ markPriceToString }}
              {{ derivativeMarket.quoteToken.symbol }}
            </span>
          </div>
          <div class="flex">
            <span class="flex-1 text-left">
              <span
                v-if="
                  [
                    DerivativeTradeTypes.Limit,
                    DerivativeTradeTypes.StopLimit
                  ].includes(
                    derivativeFormValues[DerivativesTradeFormField.Type]
                  )
                "
                >{{ $t('trade.limitPrice') }}
              </span>
              <span
                v-else-if="
                  derivativeFormValues[DerivativesTradeFormField.Type] ===
                  DerivativeTradeTypes.Market
                "
                >{{ $t('trade.averagePrice') }}
              </span>
              <span
                v-else-if="
                  derivativeFormValues[DerivativesTradeFormField.Type] ===
                  DerivativeTradeTypes.StopMarket
                "
                >{{ $t('trade.triggerPrice') }}
              </span>
            </span>
            <span class="flex-1 text-left">
              {{ executionPriceToString }}
              {{ derivativeMarket.quoteToken.symbol }}
            </span>
          </div>
          <div class="flex">
            <span class="flex-1 text-left">{{
              $t('trade.priceDeviation')
            }}</span>
            <span class="flex-1 text-left">{{ priceDeviationToString }}%</span>
          </div>
        </div>

        <div class="mt-6 flex items-center justify-center gap-2">
          <AppButton class="bg-blue-500 text-blue-900 w-full" @click="confirm">
            {{ $t('trade.rwa.acknowledge') }}
          </AppButton>
        </div>
      </div>
    </div>
  </AppModal>
</template>
