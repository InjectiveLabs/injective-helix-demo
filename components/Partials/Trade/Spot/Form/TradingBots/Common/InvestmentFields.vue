<script setup lang="ts">
import { SharedUiSpotMarket } from '@shared/types'
import { BigNumberInBase, BigNumberInWei } from '@injectivelabs/utils'
import {
  InvestmentTypeGst,
  SpotGridTradingField,
  SpotGridTradingForm,
  spotMarketKey
} from '@/types'
import { MARKETS_WITH_LOW_TRADING_SIZE } from '~/app/data/grid-strategy'
import {
  GST_DEFAULT_AUTO_GRIDS,
  GST_GRID_THRESHOLD,
  GST_MIN_TRADING_SIZE,
  GST_MIN_TRADING_SIZE_LOW
} from '~/app/utils/constants'

const props = defineProps({
  isAuto: Boolean
})

const market = inject(spotMarketKey) as Ref<SharedUiSpotMarket>

const tokenStore = useTokenStore()
const walletStore = useWalletStore()

const spotFormValues = useFormValues<SpotGridTradingForm>()

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
    aggregatedPortfolioBalances.value[walletStore.authZOrDefaultSubaccountId]
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
  valueToString: quoteDenomAmountToString,
  valueToBigNumber: quoteDenomAmount
} = useSharedBigNumberFormatter(
  computed(() =>
    new BigNumberInWei(quoteDenomBalance.value?.bankBalance || 0).toBase(
      quoteDenomBalance.value?.token.decimals
    )
  ),
  { decimalPlaces: 2 }
)

const {
  valueToString: baseDenomAmountToString,
  valueToBigNumber: baseDenomAmount
} = useSharedBigNumberFormatter(
  computed(() =>
    new BigNumberInWei(baseDenomBalance.value?.bankBalance || 0).toBase(
      baseDenomBalance.value?.token.decimals
    )
  ),
  {
    decimalPlaces: 2
  }
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
      <CommonHeaderTooltip v-bind="{ tooltip: $t('sgt.investmentTooltip') }">
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
        <p>{{ market.baseToken.symbol }}</p>
        <span>+</span>
        <CommonTokenIcon is-sm v-bind="{ token: market.quoteToken }" />
        <p>{{ market.quoteToken.symbol }}</p>
      </div>
    </div>

    <AppInputField
      v-model="baseAmount"
      placeholder="0.00"
      :disabled="isUpperBoundLtLastPrice"
    >
      <template #right>
        <span>{{ market.baseToken.symbol }}</span>
      </template>

      <template #bottom>
        <div class="text-right text-xs text-gray-500">
          {{ $t('sgt.available') }}: {{ baseDenomAmountToString }}
        </div>
      </template>
    </AppInputField>

    <p v-if="baseAmountError" class="error-message">{{ baseAmountError }}</p>

    <AppInputField
      v-model="quoteAmount"
      placeholder="0.00"
      :disabled="isLowerBoundGtLastPrice"
    >
      <template #right>
        <span>{{ market.quoteToken.symbol }}</span>
      </template>

      <template #bottom>
        <div class="text-right text-xs text-gray-500">
          {{ $t('sgt.available') }}: {{ quoteDenomAmountToString }}
        </div>
      </template>
    </AppInputField>

    <p v-if="quoteAmountError" class="error-message">{{ quoteAmountError }}</p>

    <div>
      <div class="flex justify-between items-center">
        <CommonHeaderTooltip v-bind="{ tooltip: 'todo' }">
          <span class="text-gray-500">
            {{ $t('sgt.minInvestment') }}
          </span>
        </CommonHeaderTooltip>
        <p class="text-sm font-mono">${{ gridThreshold.toFormat(2) }}</p>
      </div>

      <div class="flex justify-between items-center">
        <CommonHeaderTooltip v-bind="{ tooltip: 'todo' }">
          <span class="text-gray-500">
            {{
              $t('sgt.totalBaseAndQuote', {
                base: market.baseToken.symbol,
                quote: market.quoteToken.symbol
              })
            }}
          </span>
        </CommonHeaderTooltip>
        <p class="text-sm font-mono">>= ${{ gridThreshold.toFormat(2) }}</p>
      </div>
    </div>
  </div>
</template>
