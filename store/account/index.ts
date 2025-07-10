import { defineStore } from 'pinia'
import { BigNumberInBase } from '@injectivelabs/utils'
import { walletStrategy } from '@shared/WalletService'
import { injToken, usdtToken } from '@shared/data/token'
import { alchemyRpcEndpoint } from '@shared/wallet/alchemy'
import { WalletStrategy } from '@injectivelabs/wallet-strategy'
import { Wallet, isCosmosWallet } from '@injectivelabs/wallet-base'
import { CHAIN_ID, INJ_DENOM, ETHEREUM_CHAIN_ID } from '@shared/utils/constant'
import {
  getInjectiveAddress,
  NEPTUNE_USDT_CW20_CONTRACT
} from '@injectivelabs/sdk-ts'
import {
  stakingApi,
  web3Client,
  indexerRestExplorerApi,
  indexerAccountPortfolioApi
} from '@shared/Service'
import { DEFAULT_MIN_GAS } from '@/app/utils/constants'
import { getAccountDetails } from '@/app/services/account'
import { neptuneService, indexerGrpcArchiverApi } from '@/app/Services'
import { isPgtSubaccountId, isSgtSubaccountId } from '@/app/utils/helpers'
import {
  getDefaultAccountBalances,
  getNonDefaultSubaccountBalances
} from '@/app/client/utils/account'
import {
  deposit,
  transfer,
  withdraw,
  withdrawToMain,
  externalTransfer
} from '@/store/account/message'
import {
  convertNeptuneToPeggyUsdt,
  convertPeggyToNeptuneUsdt,
  fetchNeptuneRedemptionRatio
} from '@/store/account/neptune'
import {
  streamBankBalance,
  streamSubaccountBalance,
  cancelBankBalanceStream,
  cancelSubaccountBalanceStream
} from '@/store/account/stream'
import { BusEvents } from '@/types'
import type { SubaccountBalance } from '@/types'
import type { Coin } from '@injectivelabs/ts-types'
import type { Delegation, AccountStats } from '@injectivelabs/sdk-ts'

type AccountStoreState = {
  pubKey?: string
  subaccountId: string
  bankBalances: Coin[]
  singerInjBalance: string
  injDelegations: Delegation[]
  neptuneUsdtLendingApy: string
  neptuneUsdtRedemptionRatio: number
  erc20BalancesMap: Record<string, string>
  cw20Balances: { amount: string; address: string }[]
  accountStats: AccountStats | Record<string, number>
  subaccountBalancesMap: Record<string, SubaccountBalance[]>
}

const initialStateFactory = (): AccountStoreState => ({
  pubKey: '',
  bankBalances: [],
  cw20Balances: [],
  subaccountId: '',
  accountStats: {},
  injDelegations: [],
  singerInjBalance: '0',
  erc20BalancesMap: {},
  subaccountBalancesMap: {},
  neptuneUsdtLendingApy: '',
  neptuneUsdtRedemptionRatio: 0
})

export const useAccountStore = defineStore('account', {
  state: (): AccountStoreState => initialStateFactory(),
  getters: {
    hasSufficientGas: (state: AccountStoreState) => {
      const sharedWalletStore = useSharedWalletStore()

      return (
        !sharedWalletStore.isEip712 ||
        new BigNumberInBase(state.singerInjBalance).gt(DEFAULT_MIN_GAS)
      )
    },

    balancesMap: (state: AccountStoreState) => {
      if (state.bankBalances.length === 0) {
        return {}
      }

      return state.bankBalances.reduce(
        (list, balance) => {
          return { ...list, [balance.denom]: balance.amount }
        },
        {} as Record<string, string>
      )
    },

    cw20BalancesMap: (state: AccountStoreState) => {
      if (state.cw20Balances.length === 0) {
        return {}
      }

      return state.cw20Balances.reduce(
        (list, balance) => {
          return { ...list, [balance.address]: balance.amount }
        },
        {} as Record<string, string>
      )
    },

    defaultSubaccountBalances: (state: AccountStoreState) => {
      const sharedWalletStore = useSharedWalletStore()

      if (!sharedWalletStore.authZOrDefaultSubaccountId) {
        return []
      }

      return state.subaccountBalancesMap[
        sharedWalletStore.authZOrDefaultSubaccountId
      ]
    },

    isDefaultSubaccount: (state: AccountStoreState) => {
      const sharedWalletStore = useSharedWalletStore()

      return sharedWalletStore.authZOrDefaultSubaccountId === state.subaccountId
    },

    hasMultipleSubaccounts: (state: AccountStoreState) => {
      return Object.keys(state.subaccountBalancesMap).length > 1
    },

    isSgtSubaccount: (state) =>
      !!isSgtSubaccountId(state.subaccountId) ||
      !!isPgtSubaccountId(state.subaccountId),

    hasBalance: (state) => {
      return (
        state.bankBalances.length > 0 ||
        Object.keys(state.subaccountBalancesMap).length > 1
      )
    },

    neptuneUsdtInBankBalance: (state) => {
      const sharedWalletStore = useSharedWalletStore()

      if (sharedWalletStore.isAuthzWalletConnected) {
        return 0
      }

      const neptuneUsdtBalance = state.cw20Balances.find(
        (balance) => balance.address === NEPTUNE_USDT_CW20_CONTRACT
      )?.amount

      if (!neptuneUsdtBalance) {
        return 0
      }

      return neptuneService.calculateBankAmount(
        Number(neptuneUsdtBalance),
        state.neptuneUsdtRedemptionRatio
      )
    }
  },
  actions: {
    deposit,
    transfer,
    withdraw,
    withdrawToMain,
    externalTransfer,
    streamBankBalance,
    streamSubaccountBalance,
    cancelBankBalanceStream,
    convertNeptuneToPeggyUsdt,
    convertPeggyToNeptuneUsdt,
    fetchNeptuneRedemptionRatio,
    cancelSubaccountBalanceStream,

    updateSubaccount(subaccountId: string) {
      const accountStore = useAccountStore()

      accountStore.$patch({ subaccountId })
      useEventBus(BusEvents.SubaccountChange).emit(subaccountId)
    },

    async fetchSignerInjBalance() {
      const accountStore = useAccountStore()
      const sharedWalletStore = useSharedWalletStore()

      if (!sharedWalletStore.isUserConnected) {
        return
      }

      const accountPortfolio =
        await indexerAccountPortfolioApi.fetchAccountPortfolioBalances(
          sharedWalletStore.injectiveAddress
        )

      const injBalance =
        accountPortfolio.bankBalancesList.find(
          ({ denom }) => denom === injToken.denom
        )?.amount || '0'

      accountStore.$patch({
        singerInjBalance: injBalance
      })
    },

    async fetchAccountPortfolioBalances() {
      const accountStore = useAccountStore()
      const sharedWalletStore = useSharedWalletStore()

      if (!sharedWalletStore.isUserConnected) {
        return
      }

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

      // const subaccountId =
      //   accountStore.subaccountId || walletStore.authZOrDefaultSubaccountId

      accountStore.$patch((state) => {
        // state.subaccountId = subaccountId.includes(walletStore.authZOrAddress)
        //   ? subaccountId
        //   : walletStore.authZOrDefaultSubaccountId

        state.bankBalances = accountPortfolio.bankBalancesList || []

        state.subaccountBalancesMap = {
          [sharedWalletStore.authZOrDefaultSubaccountId]:
            defaultAccountBalances,
          ...nonDefaultSubaccounts
        }
      })
    },

    async fetchCw20Balances() {
      const accountStore = useAccountStore()
      const sharedWalletStore = useSharedWalletStore()

      if (!sharedWalletStore.isUserConnected) {
        return
      }

      const cw20Balances =
        await indexerRestExplorerApi.fetchCW20BalancesNoThrow(
          sharedWalletStore.authZOrInjectiveAddress
        )

      accountStore.$patch({
        cw20Balances: cw20Balances.map((balance) => ({
          address: balance.contract_address,
          amount: balance.balance
        }))
      })

      const hasNeptuneUSDTCw20Balance = cw20Balances.some(
        ({ contract_address: address, balance }) =>
          address === NEPTUNE_USDT_CW20_CONTRACT &&
          new BigNumberInBase(balance).gt(0)
      )

      if (!hasNeptuneUSDTCw20Balance) {
        return
      }

      accountStore.fetchNeptuneRedemptionRatio()
    },

    async fetchErc20Balances() {
      const accountStore = useAccountStore()
      const sharedWalletStore = useSharedWalletStore()
      const spotStore = useSpotStore()

      const evmDenoms = spotStore.tradableDenoms.filter((denom) =>
        denom.startsWith('peggy')
      )

      const erc20Balances: Record<string, string> = {}

      await Promise.all(
        evmDenoms.map(async (denom) => {
          const { balance } = await web3Client.fetchTokenBalanceAndAllowance({
            address: sharedWalletStore.address,
            contractAddress: denom.replace('peggy', '')
          })

          if (new BigNumberInBase(balance).gt(0)) {
            erc20Balances[denom] = balance
          }
        })
      )

      accountStore.$patch({
        erc20BalancesMap: erc20Balances
      })
    },

    async fetchAddressFromWalletStrategy(wallet: Wallet) {
      try {
        const walletStrategy = new WalletStrategy({
          wallet,
          chainId: CHAIN_ID,
          ethereumOptions: {
            ethereumChainId: ETHEREUM_CHAIN_ID,
            rpcUrl: alchemyRpcEndpoint
          },
          strategies: {}
        })

        const addresses = await walletStrategy.enableAndGetAddresses()
        const [address] = addresses

        // cosmos returns inj address
        if (isCosmosWallet(wallet)) {
          return address
        }

        // eth returns eth address so convert to inj address
        return getInjectiveAddress(address)
      } catch {
        // silently fail
      }
    },

    async fetchPubKey(address: string) {
      const accountStore = useAccountStore()
      const sharedWalletStore = useSharedWalletStore()

      try {
        if ([Wallet.Magic, Wallet.Turnkey].includes(sharedWalletStore.wallet)) {
          const accountDetails = await getAccountDetails(address)
          const publicKeyBase64 = accountDetails.pubKey.key

          accountStore.$patch({
            pubKey: publicKeyBase64
          })

          return
        }

        accountStore.$patch({
          pubKey: await walletStrategy.getPubKey(address)
        })
      } catch {
        // silently fail
      }
    },

    async fetchNeptuneLendingApy() {
      const accountStore = useAccountStore()
      const sharedWalletStore = useSharedWalletStore()

      if (!sharedWalletStore.isUserConnected) {
        return
      }

      const apr = await neptuneService.getLendingRateByDenom({
        denom: usdtToken.denom
      })

      if (!apr) {
        return
      }

      const neptuneUsdtLendingApy = neptuneService
        .calculateAPY(Number(apr))
        .toString()

      accountStore.$patch({
        neptuneUsdtLendingApy
      })
    },

    async fetchAccountStats() {
      const accountStore = useAccountStore()
      const sharedWalletStore = useSharedWalletStore()

      const response = await indexerGrpcArchiverApi.fetchAccountStats({
        account: sharedWalletStore.authZOrInjectiveAddress
      })

      accountStore.accountStats = response
    },

    async fetchInjDelegations() {
      const accountStore = useAccountStore()
      const sharedWalletStore = useSharedWalletStore()

      if (!sharedWalletStore.injectiveAddress) {
        return
      }

      const { delegations } = await stakingApi.fetchDelegationsNoThrow({
        injectiveAddress: sharedWalletStore.injectiveAddress
      })

      const injDelegations = delegations.filter(
        (delegation) => delegation.balance.denom === INJ_DENOM
      )

      accountStore.$patch({ injDelegations })
    },

    reset() {
      cancelBankBalanceStream()
      cancelSubaccountBalanceStream()
      useAccountStore().$reset()
    }
  }
})
