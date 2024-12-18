import { defineStore } from 'pinia'
import {
  web3Client,
  indexerRestExplorerApi,
  indexerAccountPortfolioApi
} from '@shared/Service'
import {
  Wallet,
  isCosmosWallet,
  WalletStrategy
} from '@injectivelabs/wallet-ts'
import { Coin } from '@injectivelabs/ts-types'
import { usdtToken } from '@shared/data/token'
import { getInjectiveAddress } from '@injectivelabs/sdk-ts'
import { alchemyRpcEndpoint } from '@shared/wallet/alchemy'
import { walletStrategy } from '@shared/wallet/wallet-strategy'
import { CHAIN_ID, ETHEREUM_CHAIN_ID } from '@shared/utils/constant'
import {
  streamBankBalance,
  streamSubaccountBalance,
  cancelBankBalanceStream,
  cancelSubaccountBalanceStream
} from '@/store/account/stream'
import {
  deposit,
  transfer,
  withdraw,
  withdrawToMain,
  externalTransfer
} from '@/store/account/message'
import {
  getDefaultAccountBalances,
  getNonDefaultSubaccountBalances
} from '@/app/client/utils/account'
import { getAccountDetails } from '@/app/services/account'
import { isPgtSubaccountId, isSgtSubaccountId } from '@/app/utils/helpers'
import { BusEvents, SubaccountBalance } from '@/types'

type AccountStoreState = {
  subaccountId: string
  cw20Balances: { address: string; amount: string }[]
  bankBalances: Coin[]
  subaccountBalancesMap: Record<string, SubaccountBalance[]>
  erc20BalancesMap: Record<
    string,
    {
      balance: string
      allowance: string
    }
  >
  pubKey?: string
}

const initialStateFactory = (): AccountStoreState => ({
  bankBalances: [],
  cw20Balances: [],
  subaccountId: '',
  subaccountBalancesMap: {},
  erc20BalancesMap: {},
  pubKey: ''
})

export const useAccountStore = defineStore('account', {
  state: (): AccountStoreState => initialStateFactory(),
  getters: {
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
    cancelSubaccountBalanceStream,

    updateSubaccount(subaccountId: string) {
      const accountStore = useAccountStore()

      accountStore.$patch({ subaccountId })
      useEventBus(BusEvents.SubaccountChange).emit(subaccountId)
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
    },

    async fetchErc20Balances() {
      const accountStore = useAccountStore()
      const sharedWalletStore = useSharedWalletStore()

      const { balance, allowance } =
        await web3Client.fetchTokenBalanceAndAllowance({
          address: sharedWalletStore.address,
          contractAddress: usdtToken.denom.replace('peggy', '')
        })

      accountStore.$patch({
        erc20BalancesMap: {
          [usdtToken.denom]: {
            balance,
            allowance
          }
        }
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
          }
        })

        const addresses = await walletStrategy.enableAndGetAddresses()
        const [address] = addresses

        // cosmos returns inj address
        if (isCosmosWallet(wallet)) {
          return address
        }

        // eth returns eth address so convert to inj address
        return getInjectiveAddress(address)
      } catch (e: any) {
        // silently fail
      }
    },

    async fetchPubKey(address: string) {
      const accountStore = useAccountStore()
      const sharedWalletStore = useSharedWalletStore()

      try {
        if (sharedWalletStore.wallet === Wallet.Magic) {
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
      } catch (e: any) {
        // silently fail
      }
    },

    reset() {
      cancelBankBalanceStream()
      cancelSubaccountBalanceStream()
      useAccountStore().$reset()
    }
  }
})
