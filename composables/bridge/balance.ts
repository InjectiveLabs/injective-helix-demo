import type { Ref } from 'vue'
import { ZERO_IN_BASE } from '@injectivelabs/sdk-ui-ts'
import {
  BigNumberInBase,
  BigNumberInWei,
  INJ_DENOM
} from '@injectivelabs/utils'
import { Token } from '@injectivelabs/token-metadata'
import { injToken } from '@/app/data/token'
import { INJ_GAS_BUFFER_FOR_BRIDGE, IS_DEVNET } from '@/app/utils/constants'
import {
  BalanceWithToken,
  BridgeField,
  BridgeForm,
  BridgeType,
  TransferDirection
} from '@/types'

const appendInjToken = (balances: BalanceWithToken[]) => {
  const injExistOnBalancesList = balances.some(
    ({ denom }) => denom === INJ_DENOM
  )

  if (injExistOnBalancesList) {
    return balances
  }

  return [
    ...balances,
    {
      balance: '0',
      balanceInToken: '0',
      denom: injToken.denom,
      token: injToken
    }
  ]
}

export function useBridgeBalance({
  bridgeForm,
  bridgeType
}: {
  bridgeForm: Ref<BridgeForm>
  bridgeType: Ref<BridgeType>
}) {
  const accountStore = useAccountStore()
  const bankStore = useBankStore()
  const tokenStore = useTokenStore()
  const walletStore = useWalletStore()

  const erc2Balances = computed(() => {
    const balances = tokenStore.erc20TokensWithBalanceAndPriceFromBank.map(
      (b) => {
        const balance = new BigNumberInWei(b.balance)
          .toBase(b.decimals)
          .toString()

        return {
          token: { ...b } as Token,
          denom: b.denom,
          balance,
          balanceInToken: balance
        } as BalanceWithToken
      }
    )

    return appendInjToken(balances)
  })

  const bankBalances = computed(() => {
    const balances = [...bankStore.bankErc20BalancesWithToken].map((b) => {
      const balance = new BigNumberInWei(b.balance || 0)
        .toBase(b.token.decimals)
        .toString()

      return {
        ...b,
        balance,
        balanceInToken: balance
      } as BalanceWithToken
    })

    return appendInjToken(balances)
  })

  const accountBalances = computed(() => {
    const balances = accountStore.subaccountBalancesWithToken.map((b) => {
      const balance = new BigNumberInWei(b.availableBalance || 0)
        .toBase(b.token.decimals)
        .toString()

      return {
        ...b,
        balance,
        balanceInToken: balance
      } as BalanceWithToken
    })

    return appendInjToken(balances)
  })

  const balancesWithToken = computed<BalanceWithToken[]>(() => {
    switch (bridgeType.value) {
      case BridgeType.Deposit:
        return erc2Balances.value
      case BridgeType.Withdraw:
        return bankBalances.value
      default: {
        return bridgeForm.value[BridgeField.TransferDirection] ===
          TransferDirection.bankToTradingAccount
          ? bankBalances.value
          : accountBalances.value
      }
    }
  })

  const transferableBalancesWithToken = computed(() => {
    return balancesWithToken.value.map((balanceWithToken) => {
      // fee delegation don't work on devnet
      const isWalletExemptFromGasFee = walletStore.isCosmosWallet || !IS_DEVNET

      if (
        isWalletExemptFromGasFee ||
        bridgeForm.value[BridgeField.TransferDirection] ===
          TransferDirection.tradingAccountToBank ||
        balanceWithToken.denom !== INJ_DENOM
      ) {
        return balanceWithToken
      }

      const transferableBalance = new BigNumberInBase(
        balanceWithToken.balance
      ).minus(INJ_GAS_BUFFER_FOR_BRIDGE)

      if (transferableBalance.lte(ZERO_IN_BASE)) {
        return { ...balanceWithToken, balance: '0', balanceInToken: '0' }
      }

      return {
        ...balanceWithToken,
        balance: transferableBalance.toString(),
        balanceInToken: transferableBalance.toString()
      }
    })
  })

  return { transferableBalancesWithToken }
}
