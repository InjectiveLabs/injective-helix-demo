import {
  ExitType,
  ExitConfig,
  MsgExecuteContractCompat,
  ExecArgRemoveGridStrategy,
  spotPriceToChainPriceToFixed,
  ExecArgCreateSpotGridStrategy,
  spotQuantityToChainQuantityToFixed
} from '@injectivelabs/sdk-ts'
import { GeneralException } from '@injectivelabs/exceptions'
import { BigNumberInBase } from '@injectivelabs/utils'
import { backupPromiseCall } from '@/app/utils/async'
import { spotGridMarkets } from '@/app/data/grid-strategy'
import { addressAndMarketSlugToSubaccountId } from '@/app/utils/helpers'
import { msgBroadcastClient } from '@/app/Services'
import { SpotGridTradingForm, SpotGridTradingField } from '@/types'

export const createStrategy = async ({
  [SpotGridTradingField.Grids]: grids,
  [SpotGridTradingField.StopLoss]: stopLoss,
  [SpotGridTradingField.ExitType]: exitType,
  [SpotGridTradingField.UpperPrice]: upperPrice,
  [SpotGridTradingField.LowerPrice]: lowerPrice,
  [SpotGridTradingField.TakeProfit]: takeProfit,
  [SpotGridTradingField.SettleIn]: isSettleInEnabled,
  [SpotGridTradingField.InvestmentAmount]: quoteAmount,
  [SpotGridTradingField.BaseInvestmentAmount]: baseAmount,
  [SpotGridTradingField.SellBaseOnStopLoss]: isSellBaseOnStopLossEnabled,
  [SpotGridTradingField.BuyBaseOnTakeProfit]: isBuyBaseOnTakeProfitEnabled,
  [SpotGridTradingField.StrategyType]: strategyType
}: Partial<SpotGridTradingForm>) => {
  const appStore = useAppStore()
  const walletStore = useWalletStore()
  const accountStore = useAccountStore()
  const gridStrategyStore = useGridStrategyStore()

  const levels = Number(grids)

  if (!walletStore.injectiveAddress) {
    return
  }

  if (!gridStrategyStore.spotMarket) {
    return
  }

  if (!baseAmount && !quoteAmount) {
    return
  }

  if (!lowerPrice || !upperPrice) {
    return
  }

  await appStore.queue()
  await walletStore.validate()

  if (walletStore.isAuthzWalletConnected) {
    throw new GeneralException(new Error('AuthZ not supported for this action'))
  }

  const gridMarket = spotGridMarkets.find(
    (market) => market.slug === gridStrategyStore.spotMarket!.slug
  )

  if (!gridMarket) {
    return
  }

  const gridStrategySubaccountId = addressAndMarketSlugToSubaccountId(
    walletStore.address,
    gridMarket.slug
  )

  const funds = []

  if (baseAmount && !new BigNumberInBase(baseAmount).eq(0)) {
    funds.push({
      denom: gridStrategyStore.spotMarket.baseToken.denom,
      amount: spotQuantityToChainQuantityToFixed({
        value: baseAmount,
        baseDecimals: gridStrategyStore.spotMarket.baseToken.decimals
      })
    })
  }

  if (quoteAmount && !new BigNumberInBase(quoteAmount).eq(0)) {
    funds.push({
      denom: gridStrategyStore.spotMarket.quoteToken.denom,
      amount: spotQuantityToChainQuantityToFixed({
        value: quoteAmount,
        baseDecimals: gridStrategyStore.spotMarket.quoteToken.decimals
      })
    })
  }

  const stopLossValue: ExitConfig | undefined = stopLoss
    ? {
        exitPrice: spotPriceToChainPriceToFixed({
          value: stopLoss,
          baseDecimals: gridStrategyStore.spotMarket.baseToken.decimals,
          quoteDecimals: gridStrategyStore.spotMarket.quoteToken.decimals
        }),
        exitType: isSellBaseOnStopLossEnabled
          ? ExitType.Quote
          : ExitType.Default
      }
    : undefined

  const takeProfitValue: ExitConfig | undefined = takeProfit
    ? {
        exitPrice: spotPriceToChainPriceToFixed({
          value: takeProfit,
          baseDecimals: gridStrategyStore.spotMarket.baseToken.decimals,
          quoteDecimals: gridStrategyStore.spotMarket.quoteToken.decimals
        }),
        exitType: isBuyBaseOnTakeProfitEnabled
          ? ExitType.Base
          : ExitType.Default
      }
    : undefined

  const message = MsgExecuteContractCompat.fromJSON({
    contractAddress: gridMarket.contractAddress,
    sender: walletStore.injectiveAddress,
    execArgs: ExecArgCreateSpotGridStrategy.fromJSON({
      levels,
      stopLoss: stopLossValue,
      takeProfit: takeProfitValue,
      subaccountId: gridStrategySubaccountId,
      lowerBound: spotPriceToChainPriceToFixed({
        value: lowerPrice,
        baseDecimals: gridStrategyStore.spotMarket.baseToken.decimals,
        quoteDecimals: gridStrategyStore.spotMarket.quoteToken.decimals
      }),
      upperBound: spotPriceToChainPriceToFixed({
        value: upperPrice,
        baseDecimals: gridStrategyStore.spotMarket.baseToken.decimals,
        quoteDecimals: gridStrategyStore.spotMarket.quoteToken.decimals
      }),
      exitType: isSettleInEnabled && exitType ? exitType : ExitType.Default,
      strategyType
    }),

    funds
  })

  await msgBroadcastClient.broadcastWithFeeDelegation({
    msgs: message,
    injectiveAddress: walletStore.injectiveAddress
  })

  backupPromiseCall(() => gridStrategyStore.fetchStrategies())
  backupPromiseCall(() => accountStore.fetchAccountPortfolioBalances())
}

export const removeStrategy = async (contractAddress?: string) => {
  const appStore = useAppStore()
  const walletStore = useWalletStore()
  const accountStore = useAccountStore()
  const gridStrategyStore = useGridStrategyStore()

  if (!walletStore.isUserWalletConnected) {
    return
  }

  if (!gridStrategyStore.spotMarket) {
    return
  }

  await appStore.queue()
  await walletStore.validate()

  if (walletStore.isAuthzWalletConnected) {
    throw new GeneralException(new Error('AuthZ not supported for this action'))
  }

  const gridMarket = spotGridMarkets.find(
    (m) => m.slug === gridStrategyStore.spotMarket!.slug
  )

  if (!gridMarket) {
    return
  }

  const gridStrategySubaccountId = addressAndMarketSlugToSubaccountId(
    walletStore.address,
    gridStrategyStore.spotMarket.slug
  )

  const message = MsgExecuteContractCompat.fromJSON({
    contractAddress: contractAddress || gridMarket.contractAddress,
    sender: walletStore.injectiveAddress,
    execArgs: ExecArgRemoveGridStrategy.fromJSON({
      subaccountId: gridStrategySubaccountId
    })
  })

  await msgBroadcastClient.broadcastWithFeeDelegation({
    msgs: message,
    injectiveAddress: walletStore.injectiveAddress
  })

  backupPromiseCall(() => gridStrategyStore.fetchStrategies())
  backupPromiseCall(() => accountStore.fetchAccountPortfolioBalances())
}

export const removeStrategyForSubaccount = async (
  contractAddress?: string,
  subaccountId?: string
) => {
  const appStore = useAppStore()
  const walletStore = useWalletStore()
  const accountStore = useAccountStore()
  const gridStrategyStore = useGridStrategyStore()

  if (!walletStore.isUserWalletConnected) {
    return
  }

  if (!contractAddress) {
    return
  }

  await appStore.queue()
  await walletStore.validate()

  if (walletStore.isAuthzWalletConnected) {
    throw new GeneralException(new Error('AuthZ not supported for this action'))
  }

  const message = MsgExecuteContractCompat.fromJSON({
    contractAddress,
    sender: walletStore.injectiveAddress,
    execArgs: ExecArgRemoveGridStrategy.fromJSON({
      subaccountId: subaccountId || accountStore.subaccountId
    })
  })

  await msgBroadcastClient.broadcastWithFeeDelegation({
    msgs: message,
    injectiveAddress: walletStore.injectiveAddress
  })

  backupPromiseCall(() => gridStrategyStore.fetchStrategies())
  backupPromiseCall(() => accountStore.fetchAccountPortfolioBalances())
}
