<script setup lang="ts">
import { dataCyTag } from '@shared/utils'
import { BigNumberInBase } from '@injectivelabs/utils'
import {
  BusEvents,
  MarketKey,
  UiDerivativeMarket,
  DerivativesTradeForm,
  PerpetualMarketCyTags,
  DerivativesTradeFormField
} from '@/types'

const appStore = useAppStore()
const tokenStore = useTokenStore()
const orderbookStore = useOrderbookStore()
const derivativeFormValues = useFormValues<DerivativesTradeForm>()

const market = inject(MarketKey) as Ref<UiDerivativeMarket>

const { lastTradedPrice } = useDerivativeLastPrice(computed(() => market.value))

const { value: limit, errorMessage } = useStringField({
  name: DerivativesTradeFormField.LimitPrice,
  initialValue: '',
  dynamicRule: computed(() => {
    if (
      appStore.devMode ||
      derivativeFormValues.value[DerivativesTradeFormField.BypassPriceWarning]
    ) {
      return ''
    }

    return `priceTooFarFromLastTradePrice:${lastTradedPrice.value?.toFixed()}`
  })
})

const { valueToFixed: limitPriceInUsdToFixed } = useSharedBigNumberFormatter(
  computed(() =>
    new BigNumberInBase(limit.value || 0).times(
      tokenStore.tokenUsdPrice(market.value.quoteToken)
    )
  )
)

function setMidLimitPrice() {
  if (!orderbookStore.midPrice) {
    return
  }

  limit.value = new BigNumberInBase(orderbookStore.midPrice).toFixed(
    market.value.priceDecimals,
    BigNumberInBase.ROUND_DOWN
  )
}

onMounted(() => {
  useEventBus(BusEvents.OrderbookPriceClick).on((price: any) => {
    limit.value = price
  })
})
</script>

<template>
  <div v-if="market" class="space-y-2">
    <div class="flex justify-between items-center">
      <p class="field-label">{{ $t('trade.limitPrice') }}</p>

      <div class="text-xs text-coolGray-450 font-mono">
        <span>~$</span>
        <AppUsdAmount
          v-bind="{
            amount: limitPriceInUsdToFixed
          }"
        />
      </div>
    </div>

    <AppInputField
      v-model="limit"
      v-bind="{
        placeholder: '0.00',
        decimals: market.priceDecimals
      }"
      :data-cy="dataCyTag(PerpetualMarketCyTags.LimitpriceInputField)"
    >
      <template #left>
        <div
          class="text-xs text-coolGray-400 select-none hover:text-white flex font-mono cursor-pointer"
          @click="setMidLimitPrice"
        >
          {{ $t('trade.mid') }}
        </div>
      </template>

      <template #right>
        <span class="text-sm flex items-center text-white">
          {{ market.quoteToken.symbol }}
        </span>
      </template>
    </AppInputField>

    <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>
  </div>
</template>
