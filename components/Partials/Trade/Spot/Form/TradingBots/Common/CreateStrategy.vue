<script setup lang="ts">
import { ZERO_IN_BASE } from '@shared/utils/constant'
import { sharedToBalanceInTokenInBase } from '@shared/utils/formatter'
import { Status, StatusType, BigNumberInBase } from '@injectivelabs/utils'
import * as EventTracker from '@/app/providers/mixpanel/EventTracker'
import {
  GST_GRID_THRESHOLD,
  GST_MIN_TRADING_SIZE,
  GST_DEFAULT_AUTO_GRIDS,
  UI_DEFAULT_MIN_DISPLAY_DECIMALS
} from '@/app/utils/constants'
import {
  Modal,
  BotType,
  ExitType,
  MarketKey,
  InvestmentTypeGst,
  SpotGridTradingField,
  SpotGridStrategyType
} from '@/types'
import type { ExitConfig, UiSpotMarket, SpotGridTradingForm } from '@/types'

const market = inject(MarketKey) as Ref<UiSpotMarket>

const spotStore = useSpotStore()
const validate = useValidateForm()
const formErrors = useFormErrors()
const jsonStore = useSharedJsonStore()
const modalStore = useSharedModalStore()
const setFormValues = useSetFormValues()
const sharedWalletStore = useSharedWalletStore()
const gridStrategyStore = useGridStrategyStore()
const notificationStore = useSharedNotificationStore()
const spotFormValues = useFormValues<SpotGridTradingForm>()
const { t } = useLang()
const { $onError } = useNuxtApp()
const { subaccountPortfolioBalanceMap } = useBalance()

const props = withDefaults(
  defineProps<{
    isAuto?: boolean
  }>(),
  {
    isAuto: false
  }
)

const status = reactive(new Status(StatusType.Idle))

const accountBalance = computed(
  () =>
    subaccountPortfolioBalanceMap.value[
      sharedWalletStore.authZOrDefaultSubaccountId
    ]
)

const quoteDenomBalance = computed(() =>
  accountBalance.value.find(
    (balance) => balance.denom === market.value.quoteDenom
  )
)

const quoteDenomAmount = computed(() =>
  sharedToBalanceInTokenInBase({
    decimalPlaces: quoteDenomBalance.value?.token.decimals,
    value: quoteDenomBalance.value?.availableBalance || 0
  })
)

const baseDenomBalance = computed(() =>
  accountBalance.value.find(
    (balance) => balance.denom === market.value.baseDenom
  )
)

const baseDenomAmount = computed(() =>
  sharedToBalanceInTokenInBase({
    decimalPlaces: baseDenomBalance.value?.token.decimals,
    value: baseDenomBalance.value?.availableBalance || 0
  })
)

const isDisabled = computed(() => {
  if (sharedWalletStore.isAuthzWalletConnected) {
    return true
  }

  if (Object.keys(formErrors.value).length > 0) {
    return true
  }

  return (
    !spotFormValues.value[SpotGridTradingField.BaseInvestmentAmount] &&
    !spotFormValues.value[SpotGridTradingField.QuoteInvestmentAmount]
  )
})

const { lastTradedPrice: currentPrice } = useSpotLastPrice(
  computed(() => market.value)
)

const isLowerBoundGtLastPrice = computed(() =>
  currentPrice.value.lt(
    spotFormValues.value[SpotGridTradingField.LowerPrice] || 0
  )
)

const isUpperBoundLtLastPrice = computed(() =>
  currentPrice.value.gt(
    spotFormValues.value[SpotGridTradingField.UpperPrice] || Infinity
  )
)

const gridThreshold = computed(() => {
  if (props.isAuto) {
    return GST_DEFAULT_AUTO_GRIDS * GST_MIN_TRADING_SIZE
  }

  const isGridHigherThanGridThreshold =
    !!spotFormValues.value[SpotGridTradingField.Grids] &&
    Number(spotFormValues.value[SpotGridTradingField.Grids]) >=
      GST_GRID_THRESHOLD

  return new BigNumberInBase(
    isGridHigherThanGridThreshold
      ? Number(spotFormValues.value[SpotGridTradingField.Grids])
      : GST_GRID_THRESHOLD
  ).times(GST_MIN_TRADING_SIZE)
})

const calculatedAmount = computed(() => {
  if (
    !spotFormValues.value[SpotGridTradingField.LowerPrice] ||
    !spotFormValues.value[SpotGridTradingField.UpperPrice] ||
    !currentPrice.value ||
    Number(spotFormValues.value[SpotGridTradingField.UpperPrice]) <=
      Number(spotFormValues.value[SpotGridTradingField.LowerPrice])
  ) {
    return { quoteAmount: ZERO_IN_BASE, baseAmount: ZERO_IN_BASE }
  }

  const lowerBoundary = new BigNumberInBase(
    spotFormValues.value[SpotGridTradingField.LowerPrice]
  )

  const upperBoundary = new BigNumberInBase(
    spotFormValues.value[SpotGridTradingField.UpperPrice]
  )

  const ratio = currentPrice.value
    .minus(lowerBoundary)
    .dividedBy(upperBoundary.minus(lowerBoundary))

  const baseAmount = initialInvestment.value
    .times(new BigNumberInBase(1).minus(ratio))
    .dividedBy(currentPrice.value)

  const quoteAmount = initialInvestment.value.times(ratio)

  return { quoteAmount, baseAmount }
})

const initialInvestment = computed(() =>
  new BigNumberInBase(
    spotFormValues.value[SpotGridTradingField.QuoteInvestmentAmount] || 0
  ).plus(
    new BigNumberInBase(
      spotFormValues.value[SpotGridTradingField.BaseInvestmentAmount] || 0
    ).times(currentPrice.value)
  )
)

const trailingParams = computed(() => {
  if (
    !spotFormValues.value[SpotGridTradingField.TrailingLower] ||
    !spotFormValues.value[SpotGridTradingField.TrailingUpper] ||
    !spotFormValues.value[SpotGridTradingField.IsTrailingEnabled]
  ) {
    return undefined
  }

  return {
    upperTrailingBound:
      spotFormValues.value[SpotGridTradingField.TrailingUpper],
    lowerTrailingBound: spotFormValues.value[SpotGridTradingField.TrailingLower]
  }
})

const stopLoss = computed(() => {
  if (!spotFormValues.value[SpotGridTradingField.StopLoss]) {
    return undefined
  }

  return {
    exitType: spotFormValues.value[SpotGridTradingField.SellBaseOnStopLoss]
      ? ExitType.Quote
      : ExitType.Default,
    exitPrice: spotFormValues.value[SpotGridTradingField.StopLoss]
  } as ExitConfig
})

const takeProfit = computed(() => {
  if (!spotFormValues.value[SpotGridTradingField.TakeProfit]) {
    return undefined
  }

  return {
    exitType: spotFormValues.value[SpotGridTradingField.BuyBaseOnTakeProfit]
      ? ExitType.Base
      : ExitType.Default,
    exitPrice: spotFormValues.value[SpotGridTradingField.TakeProfit]
  } as ExitConfig
})

const strategyType = computed(() => {
  const isLpMode = spotFormValues.value[SpotGridTradingField.IsLpMode]

  if (
    spotFormValues.value[SpotGridTradingField.StrategyType] ===
      SpotGridStrategyType.Arithmetic &&
    trailingParams.value &&
    isLpMode
  ) {
    return SpotGridStrategyType.TrailingArithmeticLP
  }

  if (
    spotFormValues.value[SpotGridTradingField.StrategyType] ===
      SpotGridStrategyType.Arithmetic &&
    trailingParams.value
  ) {
    return SpotGridStrategyType.TrailingArithmetic
  }

  if (
    isLpMode &&
    spotFormValues.value[SpotGridTradingField.StrategyType] ===
      SpotGridStrategyType.Arithmetic
  ) {
    return SpotGridStrategyType.ArithmeticLP
  }

  if (
    spotFormValues.value[SpotGridTradingField.StrategyType] ===
    SpotGridStrategyType.Geometric
  ) {
    return SpotGridStrategyType.Geometric
  }

  return SpotGridStrategyType.Arithmetic
})

function onInvestmentTypeSet() {
  setFormValues({
    [SpotGridTradingField.QuoteInvestmentAmount]:
      calculatedAmount.value.quoteAmount.toFixed(
        UI_DEFAULT_MIN_DISPLAY_DECIMALS
      ),
    [SpotGridTradingField.BaseInvestmentAmount]:
      calculatedAmount.value.baseAmount.toFixed(
        UI_DEFAULT_MIN_DISPLAY_DECIMALS
      ),
    [SpotGridTradingField.InvestmentType]: InvestmentTypeGst.BaseAndQuote
  })

  createStrategy()
}

async function onCheckBalanceFees() {
  const { valid } = await validate()

  if (!valid) {
    return
  }

  if (
    !props.isAuto &&
    (isLowerBoundGtLastPrice.value || isUpperBoundLtLastPrice.value)
  ) {
    createStrategy()

    return
  }

  const minAmount = new BigNumberInBase(gridThreshold.value)

  const baseInUsdt = new BigNumberInBase(
    calculatedAmount.value.baseAmount
  ).times(currentPrice.value)

  const isBaseLtBalance = baseDenomAmount.value.gt(
    calculatedAmount.value.baseAmount
  )

  const isQuoteLtBalance = quoteDenomAmount.value.gt(
    calculatedAmount.value.quoteAmount
  )

  const isCalculatedLessThanMinimum = minAmount
    .minus(0.1)
    .gt(baseInUsdt.plus(calculatedAmount.value.quoteAmount))

  if (isBaseLtBalance && isQuoteLtBalance && !isCalculatedLessThanMinimum) {
    modalStore.openModal(Modal.SgtBalancedFees)
  } else {
    createStrategy()
  }
}

async function createStrategy() {
  const { valid } = await validate()

  if (
    !valid ||
    !market.value ||
    !spotFormValues.value[SpotGridTradingField.LowerPrice] ||
    !spotFormValues.value[SpotGridTradingField.UpperPrice] ||
    !spotFormValues.value[SpotGridTradingField.Grids] ||
    (!spotFormValues.value[SpotGridTradingField.QuoteInvestmentAmount] &&
      !spotFormValues.value[SpotGridTradingField.BaseInvestmentAmount])
  ) {
    return
  }

  status.setLoading()

  let err: Error

  gridStrategyStore
    .createSpotGridStrategy({
      quoteAmount:
        spotFormValues.value[SpotGridTradingField.QuoteInvestmentAmount],
      baseAmount:
        spotFormValues.value[SpotGridTradingField.BaseInvestmentAmount],
      lowerPrice: spotFormValues.value[SpotGridTradingField.LowerPrice],
      upperPrice: spotFormValues.value[SpotGridTradingField.UpperPrice],
      grids: Number(spotFormValues.value[SpotGridTradingField.Grids]),
      exitType: spotFormValues.value[SpotGridTradingField.ExitType],
      trailingParams: trailingParams.value,
      strategyType: strategyType.value,
      takeProfit: takeProfit.value,
      stopLoss: stopLoss.value,
      market: market.value
    })
    .then(() => {
      notificationStore.update({
        title: t('toast.tradingBots.tradingBotCreatedSuccessfully')
      })
    })
    .catch((e) => {
      err = e

      if (e.message && e.originalMessage) {
        EventTracker.trackTradingBotError({
          quoteAmount:
            spotFormValues.value[SpotGridTradingField.QuoteInvestmentAmount]!,
          baseAmount:
            spotFormValues.value[SpotGridTradingField.BaseInvestmentAmount]!,
          lowerBound: spotFormValues.value[SpotGridTradingField.LowerPrice]!,
          upperBound: spotFormValues.value[SpotGridTradingField.UpperPrice]!,
          grids: spotFormValues.value[SpotGridTradingField.Grids]!,
          wallet: sharedWalletStore.injectiveAddress,
          originalMessage: e.originalMessage || '',
          market: market.value.slug,
          botType: BotType.SpotGrid,
          error: e.message || ''
        })
      }
      $onError(e)
    })
    .finally(async () => {
      const lastTrade = await spotStore.fetchLastTrade({
        marketId: market.value.marketId
      })

      const lastTradedPrice = sharedToBalanceInTokenInBase({
        decimalPlaces:
          market.value.quoteToken.decimals - market.value.baseToken.decimals,
        value: lastTrade.price
      })

      EventTracker.trackCreateStrategy({
        marketPrice: lastTradedPrice.toFixed(market.value.priceDecimals),
        formValues: spotFormValues.value,
        market: market.value.slug || '',
        error: err?.message,
        isLiquidity: false
      })

      status.setIdle()
    })
}
</script>

<template>
  <div class="py-4">
    <AppButton
      class="w-full"
      v-bind="{ status, disabled: isDisabled || jsonStore.isPostUpgradeMode }"
      @click="onCheckBalanceFees"
    >
      <span v-if="jsonStore.isPostUpgradeMode">
        {{ $t('trade.postOnlyWarning') }}
      </span>
      <span v-else-if="sharedWalletStore.isAuthzWalletConnected">
        {{ $t('common.unauthorized') }}
      </span>
      <span v-else>{{ $t('tradingBots.createStrategy') }}</span>
    </AppButton>

    <ModalsLiquiditySgtBalancedFees
      v-bind="{
        margin: initialInvestment.toFixed(),
        baseAmount: calculatedAmount.baseAmount,
        quoteAmount: calculatedAmount.quoteAmount,
        market
      }"
      @investment-type:set="onInvestmentTypeSet"
      @strategy:create="createStrategy"
    />
  </div>
</template>
