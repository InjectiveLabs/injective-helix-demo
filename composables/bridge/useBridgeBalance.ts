import type { Ref } from 'vue'
import {
  CosmosNetworks,
  BridgingNetwork,
  BalanceWithToken,
  BalanceWithTokenAndPrice,
  tokenDenomsPerNetwork
} from '@injectivelabs/sdk-ui-ts'
import type { IbcToken, Erc20Token } from '@injectivelabs/token-metadata'
import { INJ_DENOM } from '@injectivelabs/utils'
import { BridgeForm, BridgeType, BridgeField } from '@/types'
import { isTokenWormholeToken } from '@/app/data/bridge'
import { injToken } from '@/app/data/token'

/**
 * For the bridge balances, we only use
 * the tradeable tokens that we have on the DEX
 */
export function useBridgeBalance(formValues: Ref<BridgeForm>) {
  const ibcStore = useIbcStore()
  const tokenStore = useTokenStore()
  const peggyStore = usePeggyStore()
  const accountStore = useAccountStore()
  const walletStore = useWalletStore()

  const { cosmosIbcChannelId } = useBridgeState(formValues)

  const bankBalancesWithToken = computed(() => {
    const bankBalances = accountStore.bankBalances
      .map((bankBalance) => {
        const token = tokenStore.tradeableTokens.find(
          (token) => token.denom === bankBalance.denom
        )

        return {
          token,
          denom: bankBalance.denom,
          balance: bankBalance.amount,
          usdPrice: tokenStore.tokenUsdPrice(token?.coinGeckoId || '')
        }
      })
      .filter(
        (balanceWithToken) => balanceWithToken.token
      ) as BalanceWithTokenAndPrice[]

    const hasInjBalance = bankBalances.find(
      (balance) => balance.denom === INJ_DENOM
    )

    return hasInjBalance
      ? bankBalances
      : [
          { token: injToken, denom: INJ_DENOM, balance: '0', usdPrice: 0 },
          ...bankBalances
        ]
  })

  const erc20BalancesWithToken = computed(() =>
    peggyStore.tradeableErc20BalancesWithTokenAndPrice.map((balance) => {
      return {
        ...balance,
        balance: balance.erc20Balance.balance
      } as BalanceWithToken
    })
  )

  const ibcBalancesWithToken = computed(() =>
    ibcStore.balancesWithToken
      .map((balance) => {
        return {
          balance: balance.ibcBalance.balance || '0',
          denom: balance.denom,
          token: balance.token
        }
      })
      .filter(({ denom }) =>
        tokenStore.tradeableTokens.find((token) => token.denom === denom)
      )
  )

  const ibcBalancesOnInjective = computed(() => {
    const tokenDenomPerNetwork = tokenDenomsPerNetwork.find(({ network }) => {
      return network === formValues.value[BridgeField.BridgingNetwork]
    })

    const filteredSupplyWithTokenForBridge = tokenStore.tradeableTokens
      .filter((token) => !token.ibc)
      .filter(({ denom, symbol }) => {
        const isPartOfHardcodedDenoms =
          !tokenDenomPerNetwork ||
          tokenDenomPerNetwork.denoms.includes(denom) ||
          tokenDenomPerNetwork.symbols.includes(symbol)

        return isPartOfHardcodedDenoms
      })
      .map((token) => {
        const balance = accountStore.bankBalances.find(({ denom }) => {
          return denom === token.denom
        })

        return {
          balance: balance?.amount || '0',
          denom: token.denom,
          token
        }
      })

    const filteredIbcSupplyWithTokenForBridge = (
      tokenStore.tradeableTokens.filter((token) => token.ibc) as IbcToken[]
    )
      .filter((token: IbcToken) => {
        const isSameChannel = token.ibc.channelId === cosmosIbcChannelId.value
        const isMatchingHash =
          token.denom.replace('ibc/', '') === token.ibc.hash
        const isPartOfHardcodedDenoms =
          tokenDenomPerNetwork &&
          tokenDenomPerNetwork.denoms.includes(token.denom)

        return isMatchingHash && isSameChannel && isPartOfHardcodedDenoms
      })
      .map((token: IbcToken) => {
        const balance = bankBalancesWithToken.value.find((balance) => {
          return (
            balance.denom === token.denom &&
            (balance.token as IbcToken).ibc.channelId === token.ibc.channelId
          )
        })

        return {
          token,
          balance: balance?.balance || '0',
          denom: token.denom
        }
      })

    return [
      ...filteredIbcSupplyWithTokenForBridge,
      ...filteredSupplyWithTokenForBridge
    ]
  })

  const erc20BalancesOnInjective = computed(() =>
    bankBalancesWithToken.value.filter(
      (balance) =>
        (balance.token as Erc20Token).erc20?.address &&
        (balance.denom.startsWith('peggy') || balance.denom === INJ_DENOM)
    )
  )

  const supplyWithBalance = computed(() => {
    if (formValues.value[BridgeField.BridgeType] === BridgeType.Deposit) {
      if (
        formValues.value[BridgeField.BridgingNetwork] ===
        BridgingNetwork.Ethereum
      ) {
        // We need to filter out Wormhole ERC20 transfers for the Peggy Bridge
        return erc20BalancesWithToken.value.filter(
          (erc20Balance) => !isTokenWormholeToken(erc20Balance.token)
        )
      }

      if (
        CosmosNetworks.includes(formValues.value[BridgeField.BridgingNetwork])
      ) {
        return ibcBalancesWithToken.value
      }

      return []
    }

    if (formValues.value[BridgeField.BridgeType] === BridgeType.Withdraw) {
      if (
        formValues.value[BridgeField.BridgingNetwork] ===
          BridgingNetwork.Ethereum &&
        !walletStore.isCosmosWallet
      ) {
        return erc20BalancesOnInjective.value
      }

      if (
        CosmosNetworks.includes(formValues.value[BridgeField.BridgingNetwork])
      ) {
        return ibcBalancesOnInjective.value
      }
    }

    if (formValues.value[BridgeField.BridgeType] === BridgeType.Transfer) {
      return bankBalancesWithToken.value
    }

    return []
  })

  const balanceWithToken = computed(() => {
    const balanceWithToken = supplyWithBalance.value.find(
      (b) => b.token.denom === formValues.value[BridgeField.Denom]
    )

    if (!balanceWithToken) {
      return
    }

    if (balanceWithToken.denom !== INJ_DENOM) {
      return balanceWithToken
    }

    if (formValues.value[BridgeField.BridgeType] === BridgeType.Deposit) {
      return balanceWithToken
    }

    return balanceWithToken
  })

  return {
    balanceWithToken,
    supplyWithBalance
  }
}
