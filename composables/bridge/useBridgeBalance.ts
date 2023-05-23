import type { Ref } from 'vue'
import {
  BridgingNetwork,
  BalanceWithToken,
  BalanceWithTokenAndPrice
} from '@injectivelabs/sdk-ui-ts'
import type { Erc20Token } from '@injectivelabs/token-metadata'
import { INJ_DENOM, BigNumberInWei } from '@injectivelabs/utils'
import { BridgeForm, BridgeType, BridgeField } from '@/types'
import { isTokenWormholeToken } from '@/app/data/bridge'
import { INJ_GAS_BUFFER_FOR_BRIDGE } from '@/app/utils/constants'

/**
 * For the bridge balances, we only use
 * the tradeable tokens that we have on the DEX
 */
export function useBridgeBalance(formValues: Ref<BridgeForm>) {
  const walletStore = useWalletStore()
  const tokenStore = useTokenStore()
  const peggyStore = usePeggyStore()
  const accountStore = useAccountStore()

  const bankBalancesWithToken = computed(() => {
    return accountStore.bankBalances
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
  })

  const erc20BalancesWithToken = computed(() =>
    peggyStore.tradeableErc20BalancesWithTokenAndPrice.map((balance) => {
      return {
        ...balance,
        balance: balance.erc20Balance.balance
      } as BalanceWithToken
    })
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

      return []
    }

    if (formValues.value[BridgeField.BridgeType] === BridgeType.Withdraw) {
      if (
        formValues.value[BridgeField.BridgingNetwork] ===
        BridgingNetwork.Ethereum
      ) {
        return bankBalancesWithToken.value.filter(
          (balance) => (balance.token as Erc20Token).erc20?.address
        )
      }

      return bankBalancesWithToken.value
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

    const noGasBufferNeededForTransfer = walletStore.isWalletExemptFromGasFee

    if (noGasBufferNeededForTransfer) {
      return balanceWithToken
    }

    const transferableBalance = new BigNumberInWei(balanceWithToken.balance)
      .toBase()
      .minus(INJ_GAS_BUFFER_FOR_BRIDGE)
    const transferableBalanceCapped = new BigNumberInWei(
      transferableBalance.gt(0) ? transferableBalance : 0
    )

    return {
      ...balanceWithToken,
      balance: transferableBalanceCapped.toFixed()
    } as BalanceWithToken
  })

  return {
    balanceWithToken,
    supplyWithBalance
  }
}
