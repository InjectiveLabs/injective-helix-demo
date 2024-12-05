<script setup lang="ts">
import { BigNumberInBase } from '@injectivelabs/utils'
import {
  GST_GRID_THRESHOLD,
  GST_MIN_TRADING_SIZE,
  GST_DEFAULT_AUTO_GRIDS,
  GST_MIN_TRADING_SIZE_LOW
} from '@/app/utils/constants'
import { MARKETS_WITH_LOW_TRADING_SIZE } from '@/app/data/grid-strategy'
import {
  MarketKey,
  UiSpotMarket,
  InvestmentTypeGst,
  SpotGridTradingField,
  SpotGridTradingForm
} from '@/types'

const tokenStore = useTokenStore()
const sharedWalletStore = useSharedWalletStore()
const spotFormValues = useFormValues<SpotGridTradingForm>()

const props = withDefaults(
  defineProps<{
    isAuto?: boolean
    isDisabled?: boolean
  }>(),
  {
    isAuto: false,
    isDisabled: false
  }
)

const market = inject(MarketKey) as Ref<UiSpotMarket>

const setBaseAmount = useSetFieldValue(
  SpotGridTradingField.BaseInvestmentAmount
)
const setQuoteAmount = useSetFieldValue(
  SpotGridTradingField.QuoteInvestmentAmount
)
const { aggregatedPortfolioBalances } = useBalance()
const { lastTradedPrice } = useSpotLastPrice(market)

const accountBalance = computed(
  () =>
    aggregatedPortfolioBalances.value[
      sharedWalletStore.authZOrDefaultSubaccountId
    ]
)

const quoteDenomBalance = computed(
  () =>
    accountBalance.value?.find(
      (balance) => balance.denom === market.value.quoteDenom
    )
)

const baseDenomBalance = computed(
  () =>
    accountBalance.value?.find(
      (balance) => balance.denom === market.value.baseDenom
    )
)

const gridThreshold = computed(() => {
  const isLowTradingSize = MARKETS_WITH_LOW_TRADING_SIZE.includes(
    market.value.slug
  )

  const tradingSize = isLowTradingSize
    ? GST_MIN_TRADING_SIZE_LOW
    : GST_MIN_TRADING_SIZE

  if (props.isAuto) {
    return new BigNumberInBase(GST_DEFAULT_AUTO_GRIDS).times(tradingSize)
  }

  const isGridHigherThanGridThreshold =
    !!spotFormValues.value[SpotGridTradingField.Grids] &&
    Number(spotFormValues.value[SpotGridTradingField.Grids]) >=
      GST_GRID_THRESHOLD

  return new BigNumberInBase(
    isGridHigherThanGridThreshold
      ? Number(spotFormValues.value[SpotGridTradingField.Grids])
      : GST_GRID_THRESHOLD
  ).times(tradingSize)
})

const isLowerBoundGtLastPrice = computed(() =>
  lastTradedPrice.value.lt(
    spotFormValues.value[SpotGridTradingField.LowerPrice] || 0
  )
)

const isUpperBoundLtLastPrice = computed(() =>
  lastTradedPrice.value.gt(
    spotFormValues.value[SpotGridTradingField.UpperPrice] || Infinity
  )
)

const {
  valueToBigNumber: quoteDenomAmount,
  valueToString: quoteDenomAmountToString
} = useSharedBigNumberFormatter(
  computed(() =>
    sharedToBalanceInTokenInBase({
      value: quoteDenomBalance.value?.bankBalance || 0,
      decimalPlaces: quoteDenomBalance.value?.token.decimals
    })
  )
)

const {
  valueToBigNumber: baseDenomAmount,
  valueToString: baseDenomAmountToString
} = useSharedBigNumberFormatter(
  computed(() =>
    sharedToBalanceInTokenInBase({
      value: baseDenomBalance.value?.bankBalance || 0,
      decimalPlaces: baseDenomBalance.value?.token.decimals
    })
  )
)

const { value: baseAmount, errorMessage: baseAmountError } = useStringField({
  name: SpotGridTradingField.BaseInvestmentAmount,
  initialValue: '',
  rule: '',
  dynamicRule: computed(() => {
    const requiredIfFieldEmptyRule = `requiredIfEmpty:@${SpotGridTradingField.QuoteInvestmentAmount}`

    const insufficientRule = `insufficientSgt:${baseDenomAmount.value.toFixed()}`

    const baseAmount = new BigNumberInBase(
      spotFormValues.value[SpotGridTradingField.BaseInvestmentAmount] || 0
    ).times(tokenStore.tokenUsdPrice(market.value.baseToken))

    const quoteAmount = new BigNumberInBase(
      spotFormValues.value[SpotGridTradingField.QuoteInvestmentAmount] || 0
    ).times(tokenStore.tokenUsdPrice(market.value.quoteToken))

    const minBaseAndQuoteAmountRule = `minBaseAndQuoteAmountSgt:${baseAmount.toFixed()},${quoteAmount.toFixed()},${gridThreshold.value.toFixed()},${
      market.value.baseToken.symbol
    },${market.value.quoteToken.symbol}`

    const rules = [insufficientRule, minBaseAndQuoteAmountRule]

    if (
      spotFormValues.value[SpotGridTradingField.InvestmentType] ===
      InvestmentTypeGst.BaseAndQuote
    ) {
      rules.push(requiredIfFieldEmptyRule)
    }

    if (
      spotFormValues.value[SpotGridTradingField.InvestmentType] ===
      InvestmentTypeGst.Base
    ) {
      rules.push('requiredSgt')
    }

    return rules.join('|')
  })
})

const { value: quoteAmount, errorMessage: quoteAmountError } = useStringField({
  name: SpotGridTradingField.QuoteInvestmentAmount,
  initialValue: '',
  rule: '',
  dynamicRule: computed(() => {
    const requiredIfFieldEmptyRule = `requiredIfEmpty:@${SpotGridTradingField.BaseInvestmentAmount}`

    const insufficientRule = `insufficientSgt:${quoteDenomAmount.value.toFixed()}`

    const baseAmount = new BigNumberInBase(
      spotFormValues.value[SpotGridTradingField.BaseInvestmentAmount] || 0
    ).times(tokenStore.tokenUsdPrice(market.value.baseToken))

    const quoteAmount = new BigNumberInBase(
      spotFormValues.value[SpotGridTradingField.QuoteInvestmentAmount] || 0
    ).times(tokenStore.tokenUsdPrice(market.value.quoteToken))

    const minBaseAndQuoteAmountRule = `minBaseAndQuoteAmountSgt:${baseAmount.toFixed()},${quoteAmount.toFixed()},${gridThreshold.value.toFixed()},${
      market.value.baseToken.symbol
    },${market.value.quoteToken.symbol}`

    const rules = [insufficientRule, minBaseAndQuoteAmountRule]

    if (
      spotFormValues.value[SpotGridTradingField.InvestmentType] ===
      InvestmentTypeGst.BaseAndQuote
    ) {
      rules.push(requiredIfFieldEmptyRule)
    }

    if (
      spotFormValues.value[SpotGridTradingField.InvestmentType] ===
      InvestmentTypeGst.Quote
    ) {
      rules.push('requiredSgt')
    }

    return rules.join('|')
  })
})

watch([isLowerBoundGtLastPrice, isUpperBoundLtLastPrice], () => {
  if (isLowerBoundGtLastPrice.value) {
    setQuoteAmount('', false)
  }

  if (isUpperBoundLtLastPrice.value) {
    setBaseAmount('', false)
  }
})
</script>

<template>
  <div v-if="market" class="space-y-4">
    <div class="flex justify-between items-center">
      <CommonHeaderTooltip
        v-bind="{ tooltip: $t('sgt.investmentTooltip') }"
        :popper="{
          placement: 'top',
          strategy: 'fixed',
          offsetDistance: -40
        }"
      >
        <span v-if="!isAuto" class="text-white font-semibold text-xs">
          3.
        </span>
        <span class="text-white font-semibold text-xs">
          {{ $t('sgt.amount') }}
        </span>
      </CommonHeaderTooltip>

      <div
        class="flex p-2 items-center space-x-2 text-xs bg-brand-875 rounded-md"
      >
        <CommonTokenIcon is-sm v-bind="{ token: market.baseToken }" />
        <p class="text-white text-xs font-semibold">
          {{ market.baseToken.symbol }}
        </p>
        <span class="text-white text-xs font-semibold">+</span>
        <CommonTokenIcon is-sm v-bind="{ token: market.quoteToken }" />
        <p class="text-white text-xs font-semibold">
          {{ market.quoteToken.symbol }}
        </p>
      </div>
    </div>

    <AppInputField
      v-model="baseAmount"
      placeholder="0.00"
      :disabled="isUpperBoundLtLastPrice || isDisabled"
    >
      <template #right>
        <span class="text-sm text-white">{{ market.baseToken.symbol }}</span>
      </template>

      <template #bottom>
        <div class="text-right text-2xs text-coolGray-450">
          {{ $t('sgt.available') }}: {{ baseDenomAmountToString }}
        </div>
      </template>
    </AppInputField>

    <p v-if="baseAmountError" class="error-message">{{ baseAmountError }}</p>

    <AppInputField
      v-model="quoteAmount"
      placeholder="0.00"
      :disabled="isLowerBoundGtLastPrice || isDisabled"
    >
      <template #right>
        <span class="text-sm text-white">{{ market.quoteToken.symbol }}</span>
      </template>

      <template #bottom>
        <div class="text-right text-2xs text-coolGray-450">
          {{ $t('sgt.available') }}: {{ quoteDenomAmountToString }}
        </div>
      </template>
    </AppInputField>

    <p v-if="quoteAmountError" class="error-message">{{ quoteAmountError }}</p>

    <PartialsLiquidityBotsSpotCreateCommonAmountMinDescription
      v-bind="{
        market,
        threshold: gridThreshold.toFixed(),
        investmentType: spotFormValues[SpotGridTradingField.InvestmentType]
      }"
    />
  </div>
</template>
