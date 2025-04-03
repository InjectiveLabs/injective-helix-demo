<script setup lang="ts">
import { BigNumberInBase } from '@injectivelabs/utils'
import { calculateOptimalInvestment } from '@/app/utils/sgt-optimization'
import {
  UiSpotMarket,
  Modal,
  SpotGridTradingField,
  SpotGridTradingForm
} from '@/types'
import {
  GST_GRID_THRESHOLD,
  GST_MIN_TOTAL_AMOUNT_USD,
  GST_MIN_TRADING_SIZE,
  GST_MIN_TRADING_SIZE_LOW
} from '~/app/utils/constants'
import { MARKETS_WITH_LOW_TRADING_SIZE } from '~/app/data/grid-strategy'

const props = withDefaults(
  defineProps<{
    market: UiSpotMarket
    baseQuantity: number
    quoteQuantity: number
    currentPrice: number
    lowerPriceLevel: number
    upperPriceLevel: number
  }>(),
  {}
)

const tokenStore = useTokenStore()
const modalStore = useSharedModalStore()
const sharedWalletStore = useSharedWalletStore()
const spotFormValues = useFormValues<SpotGridTradingForm>()
const { subaccountPortfolioBalanceMap } = useBalance()

const setBaseInvestmentAmount = useSetFieldValue(
  SpotGridTradingField.BaseInvestmentAmount
)
const setQuoteInvestmentAmount = useSetFieldValue(
  SpotGridTradingField.QuoteInvestmentAmount
)

const availableBalances = computed(() => {
  if (!sharedWalletStore.defaultSubaccountId) {
    return {
      availableBaseQuantity: 0,
      availableQuoteQuantity: 0
    }
  }

  const bankBalances =
    subaccountPortfolioBalanceMap.value[sharedWalletStore.defaultSubaccountId]

  const baseBalance = bankBalances.find(
    (balance) => balance.denom === props.market.baseToken.denom
  )

  const quoteBalance = bankBalances.find(
    (balance) => balance.denom === props.market.quoteToken.denom
  )

  const availableBaseQuantity = baseBalance
    ? sharedToBalanceInToken({
        value: baseBalance.availableBalance,
        decimalPlaces: props.market.baseToken.decimals
      })
    : 0

  const availableQuoteQuantity = quoteBalance
    ? sharedToBalanceInToken({
        value: quoteBalance.availableBalance,
        decimalPlaces: props.market.quoteToken.decimals
      })
    : 0

  return {
    availableBaseQuantity: new BigNumberInBase(availableBaseQuantity),
    availableQuoteQuantity: new BigNumberInBase(availableQuoteQuantity)
  }
})

const result = computed(() => {
  const {
    baseQuantity,
    quoteQuantity,
    currentPrice,
    lowerPriceLevel,
    upperPriceLevel
  } = props

  if (baseQuantity === 0 && quoteQuantity === 0) {
    return {
      percentage: 0,
      optimizedBaseAmount: '0',
      optimizedQuoteAmount: '0'
    }
  }

  if (lowerPriceLevel >= currentPrice || upperPriceLevel <= currentPrice) {
    return {
      percentage: 0,
      optimizedBaseAmount: '0',
      optimizedQuoteAmount: '0'
    }
  }

  const { ratioDifference, optimalBaseAmount, optimalQuoteAmount } =
    calculateOptimalInvestment({
      baseQuantity,
      quoteQuantity,
      currentPrice,
      lowerPriceLevel,
      upperPriceLevel
    })

  return {
    percentage: ((1 - ratioDifference) * 100).toFixed(2),
    optimizedBaseAmount: optimalBaseAmount.toFixed(
      props.market.baseToken.decimals
    ),
    optimizedQuoteAmount: optimalQuoteAmount.toFixed(
      props.market.quoteToken.decimals
    )
  }
})

const hasEnoughFundsToRebalance = computed(() => {
  const optimizedBaseAmount = new BigNumberInBase(
    result.value.optimizedBaseAmount
  )

  const optimizedQuoteAmount = new BigNumberInBase(
    result.value.optimizedQuoteAmount
  )

  return (
    optimizedBaseAmount.lte(availableBalances.value.availableBaseQuantity) &&
    optimizedQuoteAmount.lte(availableBalances.value.availableQuoteQuantity)
  )
})

const gridThreshold = computed(() => {
  const isLowTradingSize = MARKETS_WITH_LOW_TRADING_SIZE.includes(
    props.market.slug
  )

  const tradingSize = isLowTradingSize
    ? GST_MIN_TRADING_SIZE_LOW
    : GST_MIN_TRADING_SIZE

  const isGridHigherThanGridThreshold =
    !!spotFormValues.value[SpotGridTradingField.Grids] &&
    Number(spotFormValues.value[SpotGridTradingField.Grids]) >
      GST_GRID_THRESHOLD

  if (!isGridHigherThanGridThreshold) {
    return new BigNumberInBase(GST_MIN_TOTAL_AMOUNT_USD)
  }

  return new BigNumberInBase(
    spotFormValues.value[SpotGridTradingField.Grids] || GST_GRID_THRESHOLD
  ).times(tradingSize)
})

const isMinimumInvestmentAmount = computed(() => {
  const baseAmount = new BigNumberInBase(props.baseQuantity).times(
    tokenStore.tokenUsdPrice(props.market.baseToken)
  )

  const quoteAmount = new BigNumberInBase(props.quoteQuantity).times(
    tokenStore.tokenUsdPrice(props.market.quoteToken)
  )

  return baseAmount.plus(quoteAmount).gte(gridThreshold.value)
})

const isShown = computed(() => {
  if (
    (props.baseQuantity === 0 && props.quoteQuantity === 0) ||
    props.lowerPriceLevel === 0 ||
    props.upperPriceLevel === 0 ||
    !hasEnoughFundsToRebalance.value ||
    !isMinimumInvestmentAmount.value
  ) {
    return false
  }

  return true
})

function onOptimizeBalance() {
  if (!hasEnoughFundsToRebalance.value) {
    return
  }

  modalStore.openModal(Modal.OptimizeSgtValues)
}

function onAdjust() {
  setBaseInvestmentAmount(result.value.optimizedBaseAmount)
  setQuoteInvestmentAmount(result.value.optimizedQuoteAmount)
}
</script>

<template>
  <PartialsTradeSpotFormTradingBotsCommonOptimizationIndicator
    v-if="isShown"
    v-bind="{
      percentage: Number(result.percentage),
      hasEnoughFundsToRebalance
    }"
    @optimize-balance="onOptimizeBalance"
  />

  <ModalsGridTradingOptimizeSgtValues
    v-bind="{
      market,
      optimizedBaseAmount: result.optimizedBaseAmount,
      optimizedQuoteAmount: result.optimizedQuoteAmount
    }"
    @adjust:strategy="onAdjust"
  />
</template>
