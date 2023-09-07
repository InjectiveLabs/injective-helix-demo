import { BigNumberInWei, Status, StatusType } from '@injectivelabs/utils'
import { UiSpotMarketWithToken, ZERO_IN_BASE } from '@injectivelabs/sdk-ui-ts'
import { formatDistance } from 'date-fns'
import { TradingStrategy } from '@injectivelabs/sdk-ts'
import { addressAndMarketSlugToSubaccountId } from '@/app/utils/helpers'
import { backupPromiseCall } from '@/app/utils/async'
import { amplitudeGridStrategyTracker } from '@/app/providers/amplitude/GridStrategyTracker'

export default function useActiveGridStrategy(
  spotMarket: MaybeRefOrGetter<UiSpotMarketWithToken>,
  activeStrategy: MaybeRefOrGetter<TradingStrategy>
) {
  const router = useRouter()
  const spotStore = useSpotStore()
  const walletStore = useWalletStore()
  const accountStore = useAccountStore()
  const gridStrategyStore = useGridStrategyStore()
  const { success } = useNotifications()
  const { $onError } = useNuxtApp()
  const { t } = useLang()

  const status = reactive(new Status(StatusType.Idle))
  const now = ref(Date.now())

  const market = computed(() => toValue(spotMarket))

  const strategy = computed(() => toValue(activeStrategy))

  const createdAt = computed(() => strategy.value.createdAt)

  const upperBound = computed(() => {
    if (!market.value) {
      return ZERO_IN_BASE
    }

    return new BigNumberInWei(strategy.value.upperBound).toBase(
      market.value.quoteToken.decimals - market.value.baseToken.decimals
    )
  })

  const lowerBound = computed(() => {
    if (!market.value) {
      return ZERO_IN_BASE
    }

    return new BigNumberInWei(strategy.value.lowerBound).toBase(
      market.value.quoteToken.decimals - market.value.baseToken.decimals
    )
  })

  const investment = computed(() => {
    if (!market.value) return ZERO_IN_BASE

    const baseAmountInUsd = new BigNumberInWei(strategy.value.baseQuantity || 0)
      .toBase(market.value?.baseToken.decimals)
      .times(
        new BigNumberInWei(strategy.value.executionPrice).toBase(
          market.value?.quoteToken.decimals
        )
      )

    const quoteAmountInUsd = new BigNumberInWei(
      strategy.value.quoteQuantity || 0
    ).toBase(market.value?.quoteToken.decimals)

    return baseAmountInUsd.plus(quoteAmountInUsd)
  })

  const subaccountBalances = computed(
    () =>
      accountStore.subaccountBalancesMap[
        addressAndMarketSlugToSubaccountId(
          walletStore.address,
          market.value?.slug || ''
        )
      ]
  )

  const creationExecutionPrice = computed(() =>
    new BigNumberInWei(strategy.value.executionPrice).toBase(
      market.value?.quoteToken.decimals
    )
  )

  const creationQuoteQuantity = computed(() =>
    new BigNumberInWei(strategy.value.quoteQuantity || 0).toBase(
      market.value?.quoteToken.decimals
    )
  )

  const creationBaseQuantity = computed(() =>
    new BigNumberInWei(strategy.value.baseQuantity).toBase(
      market.value?.baseToken.decimals
    )
  )

  const pnl = computed(() => {
    if (!market.value || !subaccountBalances.value) {
      return ZERO_IN_BASE
    }

    const creationQuoteQuantity = new BigNumberInWei(
      strategy.value.quoteQuantity || 0
    ).toBase(market.value?.quoteToken.decimals)

    const creationBaseQuantity = new BigNumberInWei(
      strategy.value.baseQuantity
    ).toBase(market.value?.baseToken.decimals)

    const creationMidPrice = new BigNumberInWei(
      strategy.value.executionPrice
    ).toBase(market.value?.quoteToken.decimals)

    const currentQuoteQuantity = new BigNumberInWei(
      subaccountBalances.value.find(
        (balance) => balance.denom === market.value?.quoteDenom
      )?.totalBalance || 0
    ).toBase(market.value?.quoteToken.decimals)

    const currentBaseQuantity = new BigNumberInWei(
      subaccountBalances.value.find(
        (balance) => balance.denom === market.value?.baseDenom
      )?.totalBalance || 0
    ).toBase(market.value?.baseToken.decimals)

    const orderbookBuy = new BigNumberInWei(
      spotStore.orderbook?.buys[0]?.price || 0
    ).toBase(market.value.quoteToken.decimals - market.value.baseToken.decimals)

    const orderbookSell = new BigNumberInWei(
      spotStore.orderbook?.sells[0]?.price || 0
    ).toBase(market.value.quoteToken.decimals - market.value.baseToken.decimals)

    const currentMidPrice = orderbookSell
      .minus(orderbookBuy)
      .dividedBy(2)
      .plus(orderbookSell)

    return currentQuoteQuantity
      .plus(currentBaseQuantity.times(currentMidPrice))
      .minus(
        creationQuoteQuantity.plus(creationBaseQuantity.times(creationMidPrice))
      )
  })

  const percentagePnl = computed(() =>
    pnl.value.dividedBy(investment.value).times(100).toFixed(2)
  )

  const duration = computed(() =>
    formatDistance(Number(strategy.value.createdAt), now.value)
  )

  function removeStrategy() {
    status.setLoading()

    gridStrategyStore
      .removeStrategy()
      .then(() => {
        success({
          title: t('sgt.success'),
          description: t('sgt.strategyRemoved')
        })

        backupPromiseCall(() => accountStore.fetchAccountPortfolio())
        backupPromiseCall(() => gridStrategyStore.fetchStrategies())
      })
      .catch($onError)
      .finally(() => {
        status.setIdle()

        amplitudeGridStrategyTracker.removeStrategy({
          duration: duration.value,
          market: gridStrategyStore.spotMarket?.slug || '',
          totalProfit: pnl.value.toString()
        })
      })
  }

  function detailsPageChange() {
    router.push({ name: 'activity-spot' })

    accountStore.$patch({
      subaccountId: addressAndMarketSlugToSubaccountId(
        walletStore.address,
        gridStrategyStore.spotMarket?.slug || 'inj-usdt'
      )
    })
  }

  useIntervalFn(() => {
    now.value = Date.now()
  }, 1000 * 60)

  return {
    now,
    pnl,
    market,
    status,
    duration,
    createdAt,
    investment,
    upperBound,
    lowerBound,
    percentagePnl,
    removeStrategy,
    detailsPageChange,
    creationBaseQuantity,
    creationQuoteQuantity,
    creationExecutionPrice
  }
}

export type UseActiveGridStrategyType = ReturnType<typeof useActiveGridStrategy>
