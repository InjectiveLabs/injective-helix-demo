<script lang="ts" setup>
import { BigNumberInBase } from '@injectivelabs/utils'
import { rwaMarketsInIAssets } from '@/app/data/market'
import { UI_DEFAULT_MIN_DISPLAY_DECIMALS } from '@/app/utils/constants'
import {
  Modal,
  MarketKey,
  RwaMarketField,
  DerivativeTradeTypes,
  DerivativesTradeFormField
} from '@/types'
import type { UiDerivativeMarket } from '@/types'

const jsonStore = useSharedJsonStore()
const modalStore = useSharedModalStore()
const derivativeFormValues = useFormValues()
const { t } = useLang()

const derivativeMarket = inject(MarketKey) as Ref<UiDerivativeMarket>

useForm()

const props = withDefaults(defineProps<{ worstPrice: string }>(), {})
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

const isRwaMarket = computed(
  () =>
    jsonStore.helixMarketCategoriesMap.rwa.includes(
      derivativeMarket.value.marketId
    ) || rwaMarketsInIAssets.includes(derivativeMarket.value.marketId)
)

const executionPrice = computed(() => {
  switch (derivativeFormValues.value[DerivativesTradeFormField.Type]) {
    case DerivativeTradeTypes.StopMarket:
      return (
        derivativeFormValues.value[DerivativesTradeFormField.TriggerPrice] || ''
      )
    case DerivativeTradeTypes.StopLimit:
      return (
        derivativeFormValues.value[DerivativesTradeFormField.LimitPrice] || ''
      )
    case DerivativeTradeTypes.Market:
      return props.worstPrice
    case DerivativeTradeTypes.Limit:
      return (
        derivativeFormValues.value[DerivativesTradeFormField.LimitPrice] || ''
      )
    default:
      return props.worstPrice
  }
})

const priceDeviation = computed(() => {
  const numerator = new BigNumberInBase(executionPrice.value).minus(
    marketMarkPrice.value
  )
  const denominator = marketMarkPrice.value

  return Math.abs(numerator.div(denominator).toNumber()) * 100
})

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
  <AppModal
    v-model="modalStore.modals[Modal.ClosedRWAMarket]"
    :ui="{ width: 'w-full sm:max-w-[600px]' }"
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
          v-if="isRwaMarket"
          keypath="trade.rwa.marketClosedTrade"
          tag="p"
        >
          <template #marketClosedTimes>
            <NuxtLink
              class="opacity-75 cursor-pointer text-blue-500 hover:opacity-50"
              to="https://docs.pyth.network/price-feeds/market-hours"
              target="_blank"
            >
              <strong>{{ $t('trade.rwa.rwaClosedTimes') }}</strong>
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
            <SharedAmount
              v-bind="{
                useSubscript: true,
                amount: marketMarkPrice,
                shouldAbbreviate: false,
                decimals: UI_DEFAULT_MIN_DISPLAY_DECIMALS
              }"
            />
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
            <SharedAmount
              v-bind="{
                useSubscript: true,
                amount: executionPrice,
                shouldAbbreviate: false,
                decimals: UI_DEFAULT_MIN_DISPLAY_DECIMALS
              }"
            />
            {{ derivativeMarket.quoteToken.symbol }}
          </span>
        </div>

        <div
          class="flex justify-between lg:flex-col-reverse gap-2 lg:text-right"
        >
          <span class="text-white/30 text-sm">{{
            $t('trade.priceDeviation')
          }}</span>
          <span class="font-semibold">
            <SharedAmount
              v-bind="{
                useSubscript: true,
                amount: priceDeviation,
                shouldAbbreviate: false,
                decimals: UI_DEFAULT_MIN_DISPLAY_DECIMALS
              }"
            />%
          </span>
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
            {{ $t('common.cancel') }}
          </SharedButton>
          <SharedButton block :disabled="!termsAccepted" @click="confirm">
            {{ $t('common.confirm') }}
          </SharedButton>
        </div>
      </div>
    </div>
  </AppModal>
</template>
