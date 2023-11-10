import { ConcreteDataIntegrityStrategy } from '../../types'
import { BaseDataIntegrityStrategy } from './../BaseDataIntegrityStrategy'
import { SubaccountBalance } from '@/types'
import { indexerAccountPortfolioApi } from '@/app/Services'
import {
  getDefaultAccountBalances,
  getNonDefaultSubaccountBalances
} from '@/app/client/utils/account'

export class SubaccountBalanceIntegrityStrategy
  extends BaseDataIntegrityStrategy<void>
  implements
    ConcreteDataIntegrityStrategy<void, Record<string, SubaccountBalance[]>>
{
  static make(): SubaccountBalanceIntegrityStrategy {
    return new SubaccountBalanceIntegrityStrategy()
  }

  async validate(): Promise<void> {
    const walletStore = useWalletStore()
    const accountStore = useAccountStore()

    if (!walletStore.isUserWalletConnected) {
      return
    }

    if (walletStore.authZOrDefaultSubaccountId === accountStore.subaccountId) {
      return
    }

    const latestSubaccountBalancesMap = await this.fetchData()

    const existingSubaccountBalancesMap = {
      ...accountStore.subaccountBalancesMap
    }

    const isDataValid = this.verifyData(
      existingSubaccountBalancesMap,
      latestSubaccountBalancesMap
    )

    if (!isDataValid) {
      accountStore.cancelSubaccountBalanceStream()
      accountStore.$patch({
        subaccountBalancesMap: await this.fetchData()
      })
      accountStore.streamSubaccountBalance()
    }
  }

  verifyData(
    existingMap: Record<string, SubaccountBalance[]>,
    latestMap: Record<string, SubaccountBalance[]>
  ): boolean {
    const existingKeys = Object.keys(existingMap)
    const latestKeys = Object.keys(latestMap)
    if (
      existingKeys.length !== latestKeys.length ||
      !existingKeys.every((key) => latestKeys.includes(key))
    ) {
      return false
    }

    return latestKeys.every((subaccountId) => {
      const existingBalances = existingMap[subaccountId] || []
      const latestBalances = latestMap[subaccountId] || []

      if (existingBalances.length !== latestBalances.length) {
        return false
      }

      return latestBalances.every((latestBalance) => {
        const existingBalance = existingBalances.find(
          (b) => b.denom === latestBalance.denom
        )

        return (
          existingBalance &&
          existingBalance.availableBalance === latestBalance.availableBalance &&
          existingBalance.totalBalance === latestBalance.totalBalance
        )
      })
    })
  }

  async fetchData(): Promise<Record<string, SubaccountBalance[]>> {
    const walletStore = useWalletStore()

    const accountPortfolio =
      await indexerAccountPortfolioApi.fetchAccountPortfolio(
        walletStore.authZOrInjectiveAddress
      )

    const defaultAccountBalances = getDefaultAccountBalances(
      accountPortfolio.subaccountsList,
      walletStore.authZOrDefaultSubaccountId
    )

    const nonDefaultSubaccounts = getNonDefaultSubaccountBalances(
      accountPortfolio.subaccountsList,
      walletStore.authZOrDefaultSubaccountId
    )

    return {
      [walletStore.authZOrDefaultSubaccountId]: defaultAccountBalances,
      ...nonDefaultSubaccounts
    }
  }
}
