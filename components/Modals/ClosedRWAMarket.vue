<script lang="ts" setup>
import { BigNumberInBase } from '@injectivelabs/utils'
import { UI_DEFAULT_MIN_DISPLAY_DECIMALS } from '@/app/utils/constants'
import { RWA_TRADFI_MARKET_IDS } from '@/app/data/market'
import {
  Modal,
  MarketKey,
  RwaMarketField,
  UiDerivativeMarket,
  DerivativeTradeTypes,
  DerivativesTradeFormField
} from '@/types'

const modalStore = useSharedModalStore()
const derivativeFormValues = useFormValues()
const { t } = useI18n()

const derivativeMarket = inject(MarketKey) as Ref<UiDerivativeMarket>

useForm()

const props = withDefaults(defineProps<{ worstPrice: String }>(), {})
const emit = defineEmits<{
  'terms:agreed': []
}>()

const { value: termsAccepted } = useBooleanField({
  name: RwaMarketField.TermsAccepted,
  initialValue: false,
  rule: 'required'
})

const { marketMarkPrice } = useDerivativeLastPrice(
  computed(() => derivativeMarket?.value)
)

const isTradFiMarket = computed(() =>
  RWA_TRADFI_MARKET_IDS.includes(derivativeMarket.value.marketId)
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

const priceLabel = computed(() => {
  const tradeType = derivativeFormValues.value[DerivativesTradeFormField.Type]

  if (
    [DerivativeTradeTypes.Limit, DerivativeTradeTypes.StopLimit].includes(
      tradeType
    )
  ) {
    return t('trade.limitPrice')
  }

  if (tradeType === DerivativeTradeTypes.Market) {
    return t('trade.worstPrice')
  }

  if (tradeType === DerivativeTradeTypes.StopMarket) {
    return t('trade.triggerPrice')
  }

  return ''
})

function closeModal() {
  modalStore.closeModal(Modal.ClosedRWAMarket)
}

function confirm() {
  if (!termsAccepted.value) {
    return
  }

  emit('terms:agreed')
  closeModal()
}
</script>

<template>
  <UModal
    :ui="{
      width: 'w-full sm:max-w-[600px]'
    }"
    :model-value="modalStore.modals[Modal.ClosedRWAMarket]"
  >
    <div class="flex flex-col items-center justify-center p-4 lg:p-10">
      <img
        src="/svg/rwa_warning.svg"
        alt="RWA Warning"
        class="size-20 lg:size-auto"
      />

      <p class="text-xl font-semibold mt-4">
        {{ $t('trade.rwa.statusOfThisMarket') }}
      </p>

      <UBadge color="red" variant="soft" class="mt-2">
        {{ $t('trade.rwa.closed') }}
      </UBadge>

      <div class="mt-6 text-sm lg:text-base">
        <i18n-t
          v-if="!isTradFiMarket"
          keypath="trade.rwa.marketClosedTrade"
          tag="p"
        >
          <template #marketClosedTimes>
            <NuxtLink
              class="opacity-75 cursor-pointer text-blue-500 hover:opacity-50"
              to="https://docs.pyth.network/price-feeds/market-hours"
              target="_blank"
            >
              <strong>{{ $t('trade.rwa.marketClosedTimes') }}</strong>
            </NuxtLink>
          </template>
        </i18n-t>
        <i18n-t v-else keypath="trade.rwa.nyseMarketClosedTrade" tag="p">
          <template #nyseClosedTimes>
            <NuxtLink
              class="opacity-75 cursor-pointer text-blue-500 hover:opacity-50"
              to="https://docs.pyth.network/price-feeds/market-hours"
              target="_blank"
            >
              <strong>{{ $t('trade.rwa.nyseClosedTimes') }}</strong>
            </NuxtLink>
          </template>
        </i18n-t>

        <div class="text-white/30 mt-6">
          <span class="mt-2">
            {{ $t('trade.rwa.tradesCanBePlace') }}
          </span>

          <span class="mt-2 text-white italic">
            {{ $t('trade.rwa.thisMayIncreaseYourTradingRisk') }}
          </span>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 w-full mt-8 gap-2">
        <div class="flex justify-between lg:flex-col-reverse gap-2">
          <span class="text-white/30 text-sm">
            {{ $t('trade.previousMarkPrice') }}
          </span>
          <span class="font-semibold">
            {{ markPriceToString }}
            {{ derivativeMarket.quoteToken.symbol }}
          </span>
        </div>

        <div
          class="flex justify-between lg:flex-col-reverse gap-2 lg:text-center"
        >
          <span class="text-white/30 text-sm">
            {{ priceLabel }}
          </span>

          <span class="font-semibold">
            {{ executionPriceToString }}
            {{ derivativeMarket.quoteToken.symbol }}
          </span>
        </div>

        <div
          class="flex justify-between lg:flex-col-reverse gap-2 lg:text-right"
        >
          <span class="text-white/30 text-sm">{{
            $t('trade.priceDeviation')
          }}</span>
          <span class="font-semibold"> {{ priceDeviationToString }}% </span>
        </div>
      </div>

      <div class="mt-4 lg:mt-8 border-t pt-6">
        <AppCheckbox v-model="termsAccepted">
          <div class="text-sm pl-2 leading-4 tracking-wide text-white/30">
            {{ $t('trade.rwa.acknowledge') }}
          </div>
        </AppCheckbox>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-2 mt-6">
          <SharedButton variant="outline" block @click="closeModal">
            {{ $t('trade.rwa.cancel') }}
          </SharedButton>
          <SharedButton block :disabled="!termsAccepted" @click="confirm">
            {{ $t('trade.rwa.confirm') }}
          </SharedButton>
        </div>
      </div>
    </div>
  </UModal>
</template>
