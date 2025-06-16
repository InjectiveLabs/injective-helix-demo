import { streamGridStrategies as grpcStreamGridStrategies } from '@/app/client/streams/grid-strategies'

export const streamGridStrategies = (props?: {
  marketId?: string
  accountAddresses?: string[]
  onResetCallback?: () => void
}) => {
  const gridStrategyStore = useGridStrategyStore()
  const sharedWalletStore = useSharedWalletStore()

  if (!sharedWalletStore.injectiveAddress) {
    return
  }

  grpcStreamGridStrategies({
    marketId: props?.marketId,
    accountAddresses: [sharedWalletStore.injectiveAddress],
    onResetCallback: props?.onResetCallback,
    callback: ({ tradingStrategy }) => {
      if (!tradingStrategy) {
        return
      }

      const strategyKey = `${tradingStrategy.subaccountId}-${tradingStrategy.createdAt}`

      const existingIndex = gridStrategyStore.strategies.findIndex(
        (strategy) =>
          `${strategy.subaccountId}-${strategy.createdAt}` === strategyKey
      )

      if (existingIndex !== -1) {
        gridStrategyStore.strategies[existingIndex] = tradingStrategy
      } else {
        gridStrategyStore.strategies.push(tradingStrategy)
      }
    }
  })
}
