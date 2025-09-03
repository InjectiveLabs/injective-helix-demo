import { BigNumberInBase } from '@injectivelabs/utils'
import { mixpanelAnalytics } from '@/app/providers/mixpanel/BaseTracker'
import {
  MixPanelEvent,
  MixPanelStatus,
  MixPanelCounter,
  MixPanelOrderSide,
  SpotGridTradingField,
  MixPanelStrategyPage
} from '@/types'
import type { SharedMarketType } from '@shared/types'
import type {
  BotType,
  ChartViewOption,
  MixPanelOrderType,
  SpotGridTradingForm
} from '@/types'

const formatStatus = (error?: string) => ({
  Status: error ? MixPanelStatus.Error : MixPanelStatus.Success,
  Error: error || ''
})

export const trackSwap = (
  props: {
    fee: string
    minimumOutput: string
    rate: string | undefined
    slippageTolerance: string
    inputToken: string | undefined
    inputAmount: string | undefined
    outputToken: string | undefined
    outputAmount: string | undefined
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
    isBuy: boolean
    market: string
    amount: string
    leverage: string
    limitPrice: string
    postOnly?: boolean
    isAutoSign: boolean
    triggerPrice: string
    reduceOnly?: boolean
    slippageTolerance: string
    chartType: ChartViewOption
    orderType: MixPanelOrderType
    marketType: SharedMarketType
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
  market: string
  marketPrice: string
  isLiquidity: boolean
  formValues: Partial<SpotGridTradingForm>
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
    'Trailing Upper Price': formValues[SpotGridTradingField.TrailingUpper]
      ? new BigNumberInBase(formValues[SpotGridTradingField.TrailingUpper])
      : undefined,
    'Trailing Lower Price': formValues[SpotGridTradingField.TrailingLower]
      ? new BigNumberInBase(formValues[SpotGridTradingField.TrailingLower])
      : undefined,

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
    pnl: string
    market: string
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

export const trackTradingBotError = ({
  grids,
  wallet,
  market,
  botType,
  baseAmount,
  quoteAmount,
  lowerBound,
  upperBound,
  upperTrailingBound,
  lowerTrailingBound,
  originalMessage,
  error
}: {
  grids: string
  wallet: string
  market: string
  error?: string
  botType: BotType
  baseAmount: string
  lowerBound: string
  upperBound: string
  quoteAmount: string
  originalMessage?: string
  upperTrailingBound?: string
  lowerTrailingBound?: string
}) => {
  mixpanelAnalytics.track(MixPanelEvent.TradingBotError, {
    type: botType,
    Wallet: wallet,
    Market: market,
    Grids: grids,
    'Base Amount': baseAmount,
    'Quote Amount': quoteAmount,
    'Lower Bound': lowerBound,
    'Upper Bound': upperBound,
    'Upper Trailing Bound': upperTrailingBound,
    'Lower Trailing Bound': lowerTrailingBound,
    Error: error,
    'Original Message': originalMessage
  })
}

export const trackOnramperSeen = (walletAddress: string) => {
  mixpanelAnalytics.track(MixPanelEvent.OnramperSeen, {
    'Wallet Address': walletAddress
  })
}

export const trackGenericEvent = (event: MixPanelEvent) =>
  mixpanelAnalytics.track(event, {})

export const trackOnramperSuccess = ({
  network,
  orderId,
  fiatAmount,
  cryptoAmount,
  fiatCurrency,
  walletAddress,
  totalFeeInFiat,
  cryptoCurrency,
  partnerOrderId
}: {
  network: string
  orderId: string
  fiatAmount: string
  cryptoAmount: string
  fiatCurrency: string
  walletAddress: string
  totalFeeInFiat: string
  cryptoCurrency: string
  partnerOrderId: string
}) => {
  mixpanelAnalytics.track(MixPanelEvent.OnramperSuccess, {
    Network: network,
    'Wallet Address': walletAddress,
    'Order Id': orderId,
    'Partner Order Id': partnerOrderId,
    'Fiat Amount': fiatAmount,
    'Fiat Currency': fiatCurrency,
    'Crypto Amount': cryptoAmount,
    'Crypto Currency': cryptoCurrency,
    'Total Fee In Fiat': `${totalFeeInFiat} ${fiatCurrency}`
  })
}

export const trackRefereeLoggedIn = ({
  isSuccess,
  referralCode,
  refereeAddress
}: {
  isSuccess: boolean
  referralCode: string
  refereeAddress: string
}) => {
  mixpanelAnalytics.track(MixPanelEvent.RefereeLoggedIn, {
    'Referee Address': refereeAddress,
    'Referral Code': referralCode,
    'Is Success': isSuccess
  })
}

export const trackReferralCodeCreated = ({
  isSuccess,
  referralCode,
  refereeAddress
}: {
  isSuccess: boolean
  referralCode: string
  refereeAddress: string
}) => {
  mixpanelAnalytics.track(MixPanelEvent.ReferralCodeCreated, {
    'Referral Code': referralCode,
    'Referee Address': refereeAddress,
    'Is Success': isSuccess
  })
}

export const trackOnboardingUserWithNoAssets = ({
  walletType,
  isPopupShown,
  isBuyCryptoClicked
}: {
  walletType: string
  isPopupShown: boolean
  isBuyCryptoClicked?: boolean
}) => {
  mixpanelAnalytics.track(MixPanelEvent.OnboardingUserWithNoAssets, {
    'Connected Wallet': walletType,
    'Popup Shown': isPopupShown,
    'Buy Crypto Clicked': !!isBuyCryptoClicked
  })
}

export const trackOnboardingWalletEmptyWithEvmAssets = ({
  walletType,
  isPopupShown,
  isBridgeClicked
}: {
  walletType: string
  isPopupShown: boolean
  isBridgeClicked?: boolean
}) => {
  mixpanelAnalytics.track(MixPanelEvent.OnboardingWalletEmptyWithEvmAssets, {
    'Connected Wallet': walletType,
    'Popup Shown': isPopupShown,
    'Trade Clicked': !!isBridgeClicked
  })
}

export const trackOnboardingUserDoesntTrade = ({
  isPopupShown,
  isTradeClicked
}: {
  isPopupShown: boolean
  isTradeClicked?: boolean
}) => {
  mixpanelAnalytics.track(MixPanelEvent.OnboardingUserDoesntTrade, {
    'Popup Shown': isPopupShown,
    'Trade Clicked': !!isTradeClicked
  })
}

export const trackOnboardingUserBecomeReferee = ({
  isPopupShown,
  isTradeClicked,
  refereeAddress
}: {
  isPopupShown: boolean
  refereeAddress: string
  isTradeClicked?: boolean
}) => {
  mixpanelAnalytics.track(MixPanelEvent.OnboardingUserBecomeReferee, {
    'Referee Signed': refereeAddress,
    'Popup Shown': isPopupShown,
    'Trade Clicked': !!isTradeClicked
  })
}

export const trackUtmStockTwitsToast = ({
  utmMedium,
  walletType,
  utmCampaign,
  isPopupShown,
  isCtaClicked,
  utmSourcePlatform
}: {
  utmMedium?: string
  walletType: string
  utmCampaign?: string
  isPopupShown: boolean
  isCtaClicked?: boolean
  utmSourcePlatform?: string
}) => {
  mixpanelAnalytics.track(MixPanelEvent.UtmStockTwitsToast, {
    'Wallet Type': walletType,
    'Popup Shown': isPopupShown,
    'Start Here Clicked': !!isCtaClicked,
    'Utm Medium': utmMedium || '-',
    'Utm Campaign': utmCampaign || '-',
    'Utm Source Platform': utmSourcePlatform || '-'
  })
}

export const trackUtmStockTwitsBanner = ({
  utmMedium,
  walletType,
  utmCampaign,
  isCtaClicked,
  isBannerShown,
  utmSourcePlatform
}: {
  utmMedium?: string
  walletType: string
  utmCampaign?: string
  isCtaClicked?: boolean
  isBannerShown: boolean
  utmSourcePlatform?: string
}) => {
  mixpanelAnalytics.track(MixPanelEvent.UtmStockTwitsBanner, {
    'Wallet Type': walletType,
    'Banner Shown': isBannerShown,
    'Learn More Clicked': !!isCtaClicked,
    'Utm Medium': utmMedium || '-',
    'Utm Campaign': utmCampaign || '-',
    'Utm Source Platform': utmSourcePlatform || '-'
  })
}

export const trackSharePnlDownload = ({
  isModalShown,
  walletAddress,
  isDownloadClicked
}: {
  isModalShown: boolean
  walletAddress: string
  isDownloadClicked: boolean
}) => {
  mixpanelAnalytics.track(MixPanelEvent.SharePnlDownloaded, {
    'Modal Shown': isModalShown,
    'Wallet Address': walletAddress,
    'Download Clicked': isDownloadClicked
  })
}

export const trackInitialSelectedLanguage = (language: string) => {
  mixpanelAnalytics.track(MixPanelEvent.InitialSelectedLanguage, {
    'Selected Language': language
  })
}

export const trackChangeSelectedLanguage = (language: string) => {
  mixpanelAnalytics.track(MixPanelEvent.ChangeSelectedLanguage, {
    'Selected Language': language
  })
}
