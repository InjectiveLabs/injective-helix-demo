import { indexerAccountPortfolioApi } from '@shared/Service'
import {
  getDefaultAccountBalances,
  getNonDefaultSubaccountBalances
} from '@/app/client/utils/account'
import { ConcreteDataIntegrityStrategy } from '@/app/client/streams/data-integrity/types'
import { BaseDataIntegrityStrategy } from '@/app/client/streams/data-integrity/strategies'
import { SubaccountBalance } from '@/types'

export class SubaccountBalanceIntegrityStrategy
  extends BaseDataIntegrityStrategy<void>
  implements
    ConcreteDataIntegrityStrategy<void, Record<string, SubaccountBalance[]>>
{
  static make(): SubaccountBalanceIntegrityStrategy {
    return new SubaccountBalanceIntegrityStrategy()
  }

  async validate(): Promise<void> {
    const accountStore = useAccountStore()
    const sharedWalletStore = useSharedWalletStore()

    if (!sharedWalletStore.isUserConnected) {
      return
    }

    if (
      sharedWalletStore.authZOrDefaultSubaccountId === accountStore.subaccountId
    ) {
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
    const sharedWalletStore = useSharedWalletStore()

    const accountPortfolio =
      await indexerAccountPortfolioApi.fetchAccountPortfolioBalances(
        sharedWalletStore.authZOrInjectiveAddress
      )

    const defaultAccountBalances = getDefaultAccountBalances(
      accountPortfolio.subaccountsList,
      sharedWalletStore.authZOrDefaultSubaccountId
    )

    const nonDefaultSubaccounts = getNonDefaultSubaccountBalances(
      accountPortfolio.subaccountsList,
      sharedWalletStore.authZOrDefaultSubaccountId
    )

    return {
      [sharedWalletStore.authZOrDefaultSubaccountId]: defaultAccountBalances,
      ...nonDefaultSubaccounts
    }
  }
}
