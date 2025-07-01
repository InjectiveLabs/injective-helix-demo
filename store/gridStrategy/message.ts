import { BigNumberInBase } from '@injectivelabs/utils'
import { GeneralException } from '@injectivelabs/exceptions'
import {
  MsgExecuteContractCompat,
  spotPriceToChainPriceToFixed,
  derivativePriceToChainPriceToFixed,
  spotQuantityToChainQuantityToFixed
} from '@injectivelabs/sdk-ts'
import { getSpotGridStrategyType } from '@/app/grid-trading/utils'
import { addressAndMarketSlugToSubaccountId } from '@/app/utils/helpers'
import {
  prepareAuthZMsg,
  prepareWithdrawMsg,
  prepareNeptuneWithdrawMessage
} from '@/app/utils/msgs'
import {
  ExitType,
  SpotGridStrategyType,
  DerivativeGridTradingField
} from '@/types'
import type {
  ExitConfig,
  UiSpotMarket,
  UiDerivativeMarket,
  CloseGridStrategyData,
  DerivativeGridTradingForm,
  CreateSpotGridStrategyData,
  CreatePerpGridStrategyData,
  RemoveSubaccountDepositsData
} from '@/types'

export const createSpotGridStrategy = async ({
  grids,
  stopLoss,
  takeProfit,
  exitType = ExitType.Default,
  lowerPrice,
  upperPrice,
  quoteAmount,
  baseAmount,
  market,
  strategyType,
  trailingParams
}: {
  grids: number
  lowerPrice: string
  upperPrice: string
  exitType?: ExitType
  baseAmount?: string
  quoteAmount?: string
  market: UiSpotMarket
  stopLoss?: ExitConfig
  takeProfit?: ExitConfig
  strategyType: SpotGridStrategyType
  trailingParams?: {
    lowerTrailingBound: string
    upperTrailingBound: string
  }
}) => {
  const authZStore = useAuthZStore()
  const walletStore = useWalletStore()
  const accountStore = useAccountStore()
  const jsonStore = useSharedJsonStore()
  const referralStore = useReferralStore()
  const sharedWalletStore = useSharedWalletStore()

  const gridMarket = jsonStore.spotGridMarkets.find(
    (m) => m.slug === market.slug
  )

  if (!sharedWalletStore.injectiveAddress || !gridMarket) {
    return
  }

  if (!baseAmount && !quoteAmount) {
    return
  }

  if (!lowerPrice || !upperPrice) {
    return
  }

  await walletStore.validateGeo()
  await walletStore.validate()

  if (sharedWalletStore.isAuthzWalletConnected) {
    throw new GeneralException(new Error('AuthZ not supported for this action'))
  }

  const gridStrategySubaccountId = addressAndMarketSlugToSubaccountId(
    sharedWalletStore.address,
    market.slug
  )

  const funds = []

  if (baseAmount && !new BigNumberInBase(baseAmount).eq(0)) {
    funds.push({
      denom: market.baseToken.denom,
      amount: spotQuantityToChainQuantityToFixed({
        value: baseAmount,
        baseDecimals: market.baseToken.decimals
      })
    })
  }

  const quoteAmountToFixed = spotQuantityToChainQuantityToFixed({
    value: quoteAmount || '',
    baseDecimals: market.quoteToken.decimals
  })

  if (quoteAmount && !new BigNumberInBase(quoteAmount).eq(0)) {
    funds.push({
      denom: market.quoteToken.denom,
      amount: quoteAmountToFixed
    })
  }

  if (funds.length === 0) {
    throw new GeneralException(new Error('No funds to create strategy'))
  }

  const lowerBound = spotPriceToChainPriceToFixed({
    value: lowerPrice,
    baseDecimals: market.baseToken.decimals,
    quoteDecimals: market.quoteToken.decimals
  })

  const upperBound = spotPriceToChainPriceToFixed({
    value: upperPrice,
    baseDecimals: market.baseToken.decimals,
    quoteDecimals: market.quoteToken.decimals
  })

  const msgExecArgs: CreateSpotGridStrategyData = {
    subaccount_id: gridStrategySubaccountId,
    levels: grids,
    slippage: '0.1',
    exit_type: exitType,
    fee_recipient: referralStore.feeRecipient,
    strategy_type: getSpotGridStrategyType({
      strategyType,
      trailingParams,
      market
    }),
    bounds: [lowerBound, upperBound],
    stop_loss: stopLoss
      ? {
          exit_type: stopLoss.exitType,
          exit_price: spotPriceToChainPriceToFixed({
            value: stopLoss.exitPrice,
            baseDecimals: market.baseToken.decimals,
            quoteDecimals: market.quoteToken.decimals
          })
        }
      : undefined,
    take_profit: takeProfit
      ? {
          exit_type: takeProfit.exitType,
          exit_price: spotPriceToChainPriceToFixed({
            value: takeProfit.exitPrice,
            baseDecimals: market.baseToken.decimals,
            quoteDecimals: market.quoteToken.decimals
          })
        }
      : undefined
  }

  const message = MsgExecuteContractCompat.fromJSON({
    contractAddress: gridMarket.contractAddress,
    sender: sharedWalletStore.injectiveAddress,
    funds,
    msg: {
      create_strategy: msgExecArgs
    }
  })

  const cw20Messages = prepareNeptuneWithdrawMessage({
    denom: market.quoteDenom || '',
    amount: quoteAmountToFixed
  })

  await sharedWalletStore.broadcastWithFeeDelegation({
    messages: [
      ...prepareWithdrawMsg(gridStrategySubaccountId),
      ...prepareAuthZMsg(gridMarket.contractAddress),
      ...cw20Messages,
      message
    ]
  })

  sharedBackupPromiseCall(() =>
    Promise.all([
      authZStore.fetchGrants(),
      ...(cw20Messages.length > 0 ? [accountStore.fetchCw20Balances()] : []),
      accountStore.fetchAccountPortfolioBalances()
    ])
  )
}

export const removeStrategy = async (contractAddress?: string) => {
  const walletStore = useWalletStore()
  const accountStore = useAccountStore()
  const jsonStore = useSharedJsonStore()
  const sharedWalletStore = useSharedWalletStore()
  const gridStrategyStore = useGridStrategyStore()

  if (!sharedWalletStore.isUserConnected) {
    return
  }

  if (!gridStrategyStore.spotMarket) {
    return
  }

  await walletStore.validate()

  if (sharedWalletStore.isAuthzWalletConnected) {
    throw new GeneralException(new Error('AuthZ not supported for this action'))
  }

  const gridMarket = [
    ...jsonStore.spotGridMarkets,
    ...jsonStore.derivativeGridMarkets
  ].find((m) => m.slug === gridStrategyStore.spotMarket!.slug)

  if (!gridMarket) {
    return
  }

  const gridStrategySubaccountId = addressAndMarketSlugToSubaccountId(
    sharedWalletStore.address,
    gridStrategyStore.spotMarket.slug
  )

  const msg: CloseGridStrategyData = {
    close_strategy: {
      subaccount_id: gridStrategySubaccountId
    }
  }

  const messages = MsgExecuteContractCompat.fromJSON({
    contractAddress: contractAddress || gridMarket.contractAddress,
    sender: sharedWalletStore.injectiveAddress,
    msg
  })

  await sharedWalletStore.broadcastWithFeeDelegation({ messages })

  sharedBackupPromiseCall(() =>
    Promise.all([
      accountStore.fetchCw20Balances(),
      // gridStrategyStore.fetchAllStrategies(),
      accountStore.fetchAccountPortfolioBalances()
    ])
  )
}

export const removeStrategyForSubaccount = async (
  contractAddress?: string,
  subaccountId?: string
) => {
  const walletStore = useWalletStore()
  const accountStore = useAccountStore()
  const sharedWalletStore = useSharedWalletStore()

  if (!sharedWalletStore.isUserConnected) {
    return
  }

  if (!contractAddress) {
    return
  }

  await walletStore.validate()

  if (sharedWalletStore.isAuthzWalletConnected) {
    throw new GeneralException(new Error('AuthZ not supported for this action'))
  }

  const msg: CloseGridStrategyData = {
    close_strategy: {
      subaccount_id: subaccountId || accountStore.subaccountId
    }
  }

  const messages = MsgExecuteContractCompat.fromJSON({
    contractAddress,
    sender: sharedWalletStore.injectiveAddress,
    msg
  })

  await sharedWalletStore.broadcastWithFeeDelegation({ messages })

  sharedBackupPromiseCall(() =>
    Promise.all([
      accountStore.fetchCw20Balances(),
      accountStore.fetchAccountPortfolioBalances()
    ])
  )
}

export const createPerpStrategy = async (
  {
    [DerivativeGridTradingField.Grids]: grids,
    [DerivativeGridTradingField.Margin]: margin,
    [DerivativeGridTradingField.LowerPrice]: lowerPrice,
    [DerivativeGridTradingField.UpperPrice]: upperPrice,
    [DerivativeGridTradingField.Leverage]: leverage,
    [DerivativeGridTradingField.StopLoss]: stopLoss,
    [DerivativeGridTradingField.TakeProfit]: takeProfit
  }: Partial<DerivativeGridTradingForm>,
  market: UiDerivativeMarket
) => {
  const authZStore = useAuthZStore()
  const walletStore = useWalletStore()
  const accountStore = useAccountStore()
  const jsonStore = useSharedJsonStore()
  const referralStore = useReferralStore()
  const derivativeStore = useDerivativeStore()
  const sharedWalletStore = useSharedWalletStore()
  // const gridStrategyStore = useGridStrategyStore()

  if (!margin || !grids || !lowerPrice || !upperPrice || !leverage) {
    return
  }

  const gridMarket = jsonStore.derivativeGridMarkets.find(
    (m) => m.slug === market.slug
  )

  if (!gridMarket) {
    return
  }

  const levels = Number(grids)

  if (!sharedWalletStore.injectiveAddress) {
    return
  }

  if (sharedWalletStore.isAuthzWalletConnected) {
    throw new GeneralException(new Error('AuthZ not supported for this action'))
  }

  const gridStrategySubaccountId = addressAndMarketSlugToSubaccountId(
    sharedWalletStore.address,
    market.slug
  )

  const marginToFixed = spotQuantityToChainQuantityToFixed({
    value: margin,
    baseDecimals: market.quoteToken.decimals
  })

  const funds = [
    {
      amount: marginToFixed,
      denom: market.quoteToken.denom
    }
  ]

  const stopLossToChain = stopLoss
    ? derivativePriceToChainPriceToFixed({
        value: stopLoss,
        quoteDecimals: market.quoteToken.decimals
      })
    : undefined

  const takeProfitToChain = takeProfit
    ? derivativePriceToChainPriceToFixed({
        value: takeProfit,
        quoteDecimals: market.quoteToken.decimals
      })
    : undefined

  const lowerBound = derivativePriceToChainPriceToFixed({
    value: lowerPrice,
    quoteDecimals: market.quoteToken.decimals
  })

  const upperBound = derivativePriceToChainPriceToFixed({
    value: upperPrice,
    quoteDecimals: market.quoteToken.decimals
  })

  const msgExecArgs: CreatePerpGridStrategyData = {
    bounds: [lowerBound, upperBound],
    levels,
    subaccount_id: gridStrategySubaccountId,
    fee_recipient: referralStore.feeRecipient,
    slippage: '0.1',
    strategy_type: {
      perpetual: {
        margin_ratio: new BigNumberInBase(1).div(leverage).toFixed(2)
      }
    },
    stop_loss: stopLossToChain
      ? {
          exit_type: ExitType.Default,
          exit_price: stopLossToChain
        }
      : undefined,
    take_profit: takeProfitToChain
      ? {
          exit_type: ExitType.Default,
          exit_price: takeProfitToChain
        }
      : undefined
  }

  const message = MsgExecuteContractCompat.fromJSON({
    contractAddress: gridMarket.contractAddress,
    sender: sharedWalletStore.injectiveAddress,
    msg: {
      create_strategy: msgExecArgs
    },
    funds
  })

  const cw20Messages = prepareNeptuneWithdrawMessage({
    denom: market?.quoteDenom || '',
    amount: marginToFixed
  })

  await walletStore.validateGeo()
  await walletStore.validate()

  await sharedWalletStore.broadcastWithFeeDelegation({
    // The messages must be in this order
    messages: [
      ...prepareWithdrawMsg(gridStrategySubaccountId),
      ...prepareAuthZMsg(gridMarket.contractAddress),
      ...cw20Messages,
      message
    ]
  })

  sharedDelayPromiseCall(
    () =>
      Promise.all([
        authZStore.fetchGrants(),
        accountStore.fetchCw20Balances(),
        // gridStrategyStore.fetchAllStrategies(),
        accountStore.fetchAccountPortfolioBalances(),
        derivativeStore.fetchSecondarySubaccountOrders({
          marketIds: [market.marketId],
          subaccountId: gridStrategySubaccountId
        }),
        derivativeStore.fetchOrderHistoryForSubaccount({
          subaccountId: gridStrategySubaccountId
        }),
        derivativeStore.fetchSubaccountTrades({
          subaccountId: gridStrategySubaccountId
        }),
        ...(cw20Messages.length > 0 ? [accountStore.fetchCw20Balances()] : [])
      ]),
    5000
  )
}

export async function createSpotLiquidityBot(params: {
  grids: number
  lowerBound: string
  upperBound: string

  baseAmount?: string
  quoteAmount?: string

  market: UiSpotMarket
  lowerTrailingBound: string

  upperTrailingBound: string
}) {
  const walletStore = useWalletStore()
  const accountStore = useAccountStore()
  const jsonStore = useSharedJsonStore()
  const referralStore = useReferralStore()
  const sharedWalletStore = useSharedWalletStore()

  const {
    grids,
    market,
    baseAmount,
    quoteAmount,
    lowerTrailingBound,
    upperTrailingBound,
    lowerBound: lowerPrice,
    upperBound: upperPrice
  } = params

  const gridStrategySubaccountId = addressAndMarketSlugToSubaccountId(
    sharedWalletStore.address,
    market.slug
  )

  const gridMarket = jsonStore.spotGridMarkets.find(
    (m) => m.slug === market.slug
  )

  if (!gridMarket) {
    return
  }

  const funds = []

  if (baseAmount && !new BigNumberInBase(baseAmount).eq(0)) {
    funds.push({
      denom: market.baseToken.denom,
      amount: spotQuantityToChainQuantityToFixed({
        value: baseAmount,
        baseDecimals: market.baseToken.decimals
      })
    })
  }

  const quoteAmountToFixed = spotQuantityToChainQuantityToFixed({
    value: quoteAmount || '',
    baseDecimals: market.quoteToken.decimals
  })

  if (quoteAmount && !new BigNumberInBase(quoteAmount).eq(0)) {
    funds.push({
      denom: market.quoteToken.denom,
      amount: spotQuantityToChainQuantityToFixed({
        value: quoteAmount,
        baseDecimals: market.quoteToken.decimals
      })
    })
  }

  const lowerBound = spotPriceToChainPriceToFixed({
    value: lowerPrice,
    baseDecimals: market.baseToken.decimals,
    quoteDecimals: market.quoteToken.decimals
  })

  const upperBound = spotPriceToChainPriceToFixed({
    value: upperPrice,
    baseDecimals: market.baseToken.decimals,
    quoteDecimals: market.quoteToken.decimals
  })

  const msgExecArgs: CreateSpotGridStrategyData = {
    subaccount_id: gridStrategySubaccountId,
    bounds: [lowerBound, upperBound],
    levels: grids,
    slippage: '0.1',
    exit_type: ExitType.Default,
    fee_recipient: referralStore.feeRecipient ?? undefined,
    strategy_type: getSpotGridStrategyType({
      strategyType: SpotGridStrategyType.TrailingArithmeticLP,
      trailingParams: {
        lowerTrailingBound,
        upperTrailingBound
      },
      market
    })
  }

  const msg = MsgExecuteContractCompat.fromJSON({
    funds,
    contractAddress: gridMarket.contractAddress,
    sender: sharedWalletStore.injectiveAddress,
    msg: {
      create_strategy: msgExecArgs
    }
  })

  const cw20Messages = prepareNeptuneWithdrawMessage({
    denom: market?.quoteDenom || '',
    amount: quoteAmountToFixed
  })

  await walletStore.validateGeo()
  await walletStore.validate()

  await sharedWalletStore.broadcastWithFeeDelegation({
    messages: [
      ...prepareWithdrawMsg(gridStrategySubaccountId),
      ...prepareAuthZMsg(gridMarket.contractAddress),
      ...cw20Messages,
      msg
    ]
  })

  sharedBackupPromiseCall(() =>
    Promise.all([
      ...(cw20Messages.length > 0 ? [accountStore.fetchCw20Balances()] : []),
      accountStore.fetchAccountPortfolioBalances()
    ])
  )
}

export const removeSubaccountDeposits = async ({
  subaccountIds,
  contractAddress
}: {
  subaccountIds: string[]
  contractAddress: string
}) => {
  const walletStore = useWalletStore()
  const accountStore = useAccountStore()
  const sharedWalletStore = useSharedWalletStore()

  if (!sharedWalletStore.isUserConnected) {
    return
  }

  await walletStore.validate()

  if (sharedWalletStore.isAuthzWalletConnected) {
    throw new GeneralException(new Error('AuthZ not supported for this action'))
  }

  const msg: RemoveSubaccountDepositsData = {
    remove_subaccount_deposits: {
      subaccounts: subaccountIds
    }
  }

  const messages = MsgExecuteContractCompat.fromJSON({
    contractAddress,
    sender: sharedWalletStore.injectiveAddress,
    msg
  })

  await sharedWalletStore.broadcastWithFeeDelegation({ messages })

  sharedBackupPromiseCall(() =>
    Promise.all([
      accountStore.fetchCw20Balances(),
      accountStore.fetchAccountPortfolioBalances()
    ])
  )
}
