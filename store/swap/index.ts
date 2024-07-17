import { defineStore } from 'pinia'
import {
  Route,
  AtomicSwap,
  QueryAllRoutes,
  QuantityAndFees,
  QueryInputQuantity,
  QueryOutputQuantity,
  SwapQueryTransformer,
  spotQuantityToChainQuantityToFixed
} from '@injectivelabs/sdk-ts'
import { indexerSpotApi, wasmApi } from '@shared/Service'
import {
  submitAtomicOrder,
  submitAtomicOrderExactOutput
} from '@/store/swap/message'
import { excludedSwapDenoms } from '@/app/data/swap'
import { SWAP_CONTRACT_ADDRESS } from '@/app/utils/constants'
import { TokenAndPriceAndDecimals } from '@/types'

type SwapStoreState = {
  routes: Route[]
  swapHistory: AtomicSwap[]
  swapHistoryTotal: number
  outputQuantity: QuantityAndFees
  inputQuantity: QuantityAndFees
}

const initialStateFactory = (): SwapStoreState => ({
  routes: [],
  swapHistory: [],
  swapHistoryTotal: 0,
  outputQuantity: {} as QuantityAndFees,
  inputQuantity: {} as QuantityAndFees
})

export const useSwapStore = defineStore('swap', {
  state: (): SwapStoreState => initialStateFactory(),
  getters: {
    isInputEntered: (state: SwapStoreState) => {
      if (
        !state.inputQuantity.resultQuantity &&
        !state.outputQuantity.resultQuantity
      ) {
        return true
      }

      return !!state.outputQuantity.resultQuantity
    }
  },
  actions: {
    submitAtomicOrder,
    submitAtomicOrderExactOutput,

    async fetchRoutes() {
      const swapStore = useSwapStore()

      const queryAllRoutesResponse = await wasmApi.fetchSmartContractState(
        SWAP_CONTRACT_ADDRESS,
        new QueryAllRoutes({}).toPayload()
      )

      const routes =
        SwapQueryTransformer.contractAllRoutesResponseToContractAllRoutes(
          queryAllRoutesResponse
        )

      swapStore.$patch((state) => {
        state.routes = routes.filter(
          ({ sourceDenom, targetDenom }) =>
            !excludedSwapDenoms.includes(sourceDenom) &&
            !excludedSwapDenoms.includes(targetDenom)
        )
      })
    },

    async fetchOutputQuantity({
      inputAmount,
      outputToken,
      inputToken
    }: {
      inputAmount: string
      inputToken: TokenAndPriceAndDecimals
      outputToken: TokenAndPriceAndDecimals
    }) {
      const swapStore = useSwapStore()

      /* Reset */
      swapStore.inputQuantity = {} as QuantityAndFees

      const queryExecutionQuantityPayload = new QueryOutputQuantity({
        fromQuantity: spotQuantityToChainQuantityToFixed({
          value: inputAmount,
          baseDecimals: inputToken.token.decimals
        }),
        sourceDenom: inputToken.denom,
        targetDenom: outputToken.denom
      }).toPayload()

      const queryExecutionQuantityResponse =
        await wasmApi.fetchSmartContractState(
          SWAP_CONTRACT_ADDRESS,
          queryExecutionQuantityPayload
        )

      const outputQuantity =
        SwapQueryTransformer.contractQuantityResponseToContractQuantity(
          queryExecutionQuantityResponse
        )

      swapStore.$patch({
        outputQuantity
      })
    },

    async fetchInputQuantity({
      outputAmount,
      outputToken,
      inputToken
    }: {
      outputAmount: string
      inputToken: TokenAndPriceAndDecimals
      outputToken: TokenAndPriceAndDecimals
    }) {
      const swapStore = useSwapStore()

      /* Reset */
      swapStore.outputQuantity = {} as QuantityAndFees

      const queryInputQuantityPayload = new QueryInputQuantity({
        toQuantity: spotQuantityToChainQuantityToFixed({
          value: outputAmount,
          baseDecimals: outputToken.token.decimals
        }),
        sourceDenom: inputToken.denom,
        targetDenom: outputToken.denom
      }).toPayload()

      const queryInputQuantityResponse = await wasmApi.fetchSmartContractState(
        SWAP_CONTRACT_ADDRESS,
        queryInputQuantityPayload
      )

      const inputQuantity =
        SwapQueryTransformer.contractQuantityResponseToContractQuantity(
          queryInputQuantityResponse
        )

      swapStore.$patch({
        inputQuantity
      })
    },

    async fetchAtomicSwapHistory({
      skip,
      limit
    }: {
      skip?: number
      limit?: number
    } = {}) {
      const swapStore = useSwapStore()
      const sharedWalletStore = useSharedWalletStore()

      const { pagination, swapHistory } =
        await indexerSpotApi.fetchAtomicSwapHistory({
          pagination: { skip, limit },
          address: sharedWalletStore.authZOrInjectiveAddress,
          contractAddress: SWAP_CONTRACT_ADDRESS
        })

      swapStore.$patch({
        swapHistory
      })

      if (!skip || !swapStore.swapHistoryTotal) {
        swapStore.$patch({
          swapHistoryTotal: pagination?.total || 0
        })
      }
    }
  }
})
