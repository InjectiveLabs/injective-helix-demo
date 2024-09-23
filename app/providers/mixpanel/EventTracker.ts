import { SharedMarketType } from '@shared/types'
import { BigNumberInBase } from '@injectivelabs/utils'
import { mixpanelAnalytics } from '@/app/providers/mixpanel/BaseTracker'
import {
  MixPanelEvent,
  MixPanelCounter,
  MixPanelStatus,
  ChartViewOption,
  MixPanelOrderSide,
  MixPanelOrderType,
  SpotGridTradingForm,
  SpotGridTradingField,
  MixPanelStrategyPage
} from '@/types'

const formatStatus = (error?: string) => ({
  Status: error ? MixPanelStatus.Error : MixPanelStatus.Success,
  Error: error || ''
})

export const trackSwap = (
  props: {
    fee: string
    rate: string | undefined
    inputAmount: string | undefined
    outputAmount: string | undefined
    outputToken: string | undefined
    inputToken: string | undefined
    minimumOutput: string
    slippageTolerance: string
  },
  error?: string
) => {
  mixpanelAnalytics.track(MixPanelEvent.SwapClicked, {
    'Asset From': props.inputToken,
    'Asset To': props.outputToken,
    'Amount Asset From': new BigNumberInBase(props.inputAmount || 0).toNumber(),
    'Amount Asset To': new BigNumberInBase(props.outputAmount || 0).toNumber(),
    'Slippage Tolerance': new BigNumberInBase(
      props.slippageTolerance
    ).toNumber(),
    Rate: new BigNumberInBase(props.rate || 0).toNumber(),
    Fee: new BigNumberInBase(props.fee).toNumber(),
    'Minimum Amount Received': new BigNumberInBase(
      props.minimumOutput
    ).toNumber(),

    ...formatStatus(error)
  })

  if (!error) {
    mixpanelAnalytics.increment(MixPanelCounter.SwapCount)
  }
}

export const trackCreateOrder = (
  props: {
    isAutoSign: boolean
    isBuy: boolean
    market: string
    orderType: MixPanelOrderType
    marketType: SharedMarketType
    amount: string
    limitPrice: string
    leverage: string
    triggerPrice: string
    slippageTolerance: string
    reduceOnly?: boolean
    postOnly?: boolean
    chartType: ChartViewOption
  },
  error?: string
) => {
  mixpanelAnalytics.track(MixPanelEvent.PlaceOrderClicked, {
    Market: props.market,
    'Market Type': props.marketType,
    'Buy Sell': props.isBuy ? MixPanelOrderSide.Buy : MixPanelOrderSide.Sell,
    'Order Type': props.orderType,
    Amount: new BigNumberInBase(props.amount || 0).toNumber(),
    Leverage: new BigNumberInBase(props.leverage || 0).toNumber(),
    'Trigger Price': new BigNumberInBase(props.triggerPrice || 0).toNumber(),
    'Limit Price': new BigNumberInBase(props.limitPrice || 0).toNumber(),
    'Post Only': !!props.postOnly,
    'Slippage Tolerance': new BigNumberInBase(
      props.slippageTolerance || 0
    ).toNumber(),
    'Chart Type': props.chartType,
    'Reduce Only': !!props.reduceOnly,
    'Auto Sign Enabled': props.isAutoSign,

    ...formatStatus(error)
  })

  if (!error) {
    mixpanelAnalytics.increment(MixPanelCounter.CreateOrderCount)
  }
}

export const trackCreateStrategy = ({
  error,
  formValues,
  isLiquidity,
  market,
  marketPrice
}: {
  error?: string
  formValues: Partial<SpotGridTradingForm>
  market: string
  marketPrice: string
  isLiquidity: boolean
}) => {
  mixpanelAnalytics.track(MixPanelEvent.CreateGridTradingBotClicked, {
    'Lower Price': new BigNumberInBase(
      formValues[SpotGridTradingField.LowerPrice] || 0
    ).toNumber(),
    'Upper Price': new BigNumberInBase(
      formValues[SpotGridTradingField.UpperPrice] || 0
    ).toNumber(),
    'Grids Number': new BigNumberInBase(
      formValues[SpotGridTradingField.Grids] || 0
    ).toNumber(),
    'Amount Quote': new BigNumberInBase(
      formValues[SpotGridTradingField.QuoteInvestmentAmount] || 0
    ).toNumber(),
    'Amount Base': new BigNumberInBase(
      formValues[SpotGridTradingField.BaseInvestmentAmount] || 0
    ).toNumber(),
    'Market Price': new BigNumberInBase(marketPrice).toNumber(),
    Market: market,

    Page: isLiquidity
      ? MixPanelStrategyPage.LiquidityPage
      : MixPanelStrategyPage.TradingPage,

    ...formatStatus(error)
  })

  if (!error) {
    mixpanelAnalytics.increment(MixPanelCounter.CreateStrategyCount)
  }
}

export const trackRemoveStrategy = (
  props: {
    market: string
    pnl: string
    duration: string
    isLiquidity?: boolean
  },
  error?: string
) => {
  mixpanelAnalytics.track(MixPanelEvent.EndGridTradingBotClicked, {
    Market: props.market,
    PnL: new BigNumberInBase(props.pnl).toNumber(),
    Duration: new BigNumberInBase(props.duration).toNumber(),

    Page: props.isLiquidity
      ? MixPanelStrategyPage.LiquidityPage
      : MixPanelStrategyPage.TradingPage,

    ...formatStatus(error)
  })
}

export const trackLiteBridgePageView = (wallet: string, error?: string) => {
  mixpanelAnalytics.track(MixPanelEvent.LiteBridgePageView, {
    Wallet: wallet,
    ...formatStatus(error)
  })
}

export const trackLiteBridgeBridged = ({
  wallet,
  amount,
  symbol,
  error
}: {
  wallet: string
  amount: string
  symbol: string
  error?: string
}) => {
  mixpanelAnalytics.track(MixPanelEvent.LiteBridgeBridged, {
    Wallet: wallet,
    Symbol: symbol,
    Amount: new BigNumberInBase(amount).toNumber(),
    ...formatStatus(error)
  })
}
