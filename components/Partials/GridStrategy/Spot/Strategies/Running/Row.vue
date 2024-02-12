<script lang="ts" setup>
import { PropType } from 'nuxt/dist/app/compat/capi'
import type { TradingStrategy } from '@injectivelabs/sdk-ts'
import { BigNumberInWei, Status, StatusType } from '@injectivelabs/utils'
import { format, formatDistance } from 'date-fns'
import { UiSpotMarketWithToken, ZERO_IN_BASE } from '@injectivelabs/sdk-ui-ts'
import { backupPromiseCall } from '@/app/utils/async'
import { addressAndMarketSlugToSubaccountId } from '@/app/utils/helpers'
import {
  GST_AUTO_PRICE_THRESHOLD,
  UI_DEFAULT_MAX_DISPLAY_DECIMALS,
  UI_DEFAULT_MIN_DISPLAY_DECIMALS
} from '@/app/utils/constants'
import { TradingBotsSubPage } from '@/types'
import { mixpanelAnalytics } from '@/app/providers/mixpanel'

const props = defineProps({
  strategy: {
    type: Object as PropType<TradingStrategy>,
    required: true
  }
})

const emit = defineEmits<{
  'details:open': [strategy: TradingStrategy, market: UiSpotMarketWithToken]
}>()

const spotStore = useSpotStore()
const walletStore = useWalletStore()
const accountStore = useAccountStore()
const gridStrategyStore = useGridStrategyStore()
const { aggregatedPortfolioBalances } = useBalance()
const { success } = useNotifications()
const { $onError } = useNuxtApp()
const { t } = useLang()

const status = reactive(new Status(StatusType.Idle))
const now = ref(Date.now())

const market = computed(
  () =>
    spotStore.markets.find(
      ({ marketId }) => marketId === props.strategy.marketId
    )!
)

const { pnl, percentagePnl } = useActiveGridStrategy(
  market,
  computed(() => props.strategy)
)

const { upperBound, lowerBound } = useActiveGridStrategyTransformer(
  market,
  computed(() => props.strategy)
)

const marketSubaccountId = computed(() =>
  addressAndMarketSlugToSubaccountId(walletStore.address, market.value.slug)
)

const subaccountBalances = computed(
  () => aggregatedPortfolioBalances.value[marketSubaccountId.value]
)

const createdAt = computed(() =>
  format(new Date(Number(props.strategy.createdAt)), 'dd MMM HH:mm:ss')
)

const duration = computed(() =>
  formatDistance(Number(props.strategy.createdAt), now.value)
)

const { valueToString: upperBoundToString } = useBigNumberFormatter(
  upperBound,
  {
    decimalPlaces: upperBound.value.lt(GST_AUTO_PRICE_THRESHOLD)
      ? UI_DEFAULT_MAX_DISPLAY_DECIMALS
      : UI_DEFAULT_MIN_DISPLAY_DECIMALS
  }
)

const { valueToString: lowerBoundToString } = useBigNumberFormatter(
  lowerBound,
  {
    decimalPlaces: lowerBound.value.lt(GST_AUTO_PRICE_THRESHOLD)
      ? UI_DEFAULT_MAX_DISPLAY_DECIMALS
      : UI_DEFAULT_MIN_DISPLAY_DECIMALS
  }
)

const { valueToString: pnlToString } = useBigNumberFormatter(pnl, {
  decimalPlaces: UI_DEFAULT_MIN_DISPLAY_DECIMALS
})

const accountTotalBalanceInUsd = computed(() => {
  if (!subaccountBalances.value) {
    return ZERO_IN_BASE
  }

  return subaccountBalances.value.reduce(
    (total, balance) =>
      total.plus(
        new BigNumberInWei(balance.accountTotalBalanceInUsd).toBase(
          balance.token.decimals
        )
      ),
    ZERO_IN_BASE
  )
})

const { valueToString: totalInvestmentToString } = useBigNumberFormatter(
  accountTotalBalanceInUsd,
  { decimalPlaces: UI_DEFAULT_MIN_DISPLAY_DECIMALS }
)

function onRemoveStrategy() {
  status.setLoading()

  gridStrategyStore
    .removeStrategy(props.strategy.contractAddress)
    .then(() => {
      success({
        title: t('sgt.success'),
        description: t('sgt.strategyRemoved')
      })

      backupPromiseCall(() => accountStore.fetchAccountPortfolioBalances())
      backupPromiseCall(() => gridStrategyStore.fetchStrategies())
    })
    .catch($onError)
    .finally(() => {
      status.setIdle()

      mixpanelAnalytics.trackRemoveStrategy({
        duration: duration.value,
        market: market.value?.slug || '',
        totalProfit: pnlToString.value
      })
    })
}

function onDetailsPage() {
  emit('details:open', props.strategy, market.value)
}

useIntervalFn(() => {
  now.value = Date.now()
}, 1000 * 60)
</script>

<template>
  <NuxtLink
    :to="{
      name: TradingBotsSubPage.GridSpotMarket,
      params: { market: market.slug }
    }"
    class="grid grid-cols-9 gap-2 even:bg-black odd:bg-gray-950 hover:bg-gray-800 p-4 text-xs"
  >
    <div class="flex items-center">
      <span>{{ createdAt }}</span>
    </div>

    <div class="flex gap-2 items-center">
      <div class="text-left">
        <CommonTokenIcon
          v-if="market.baseToken"
          v-bind="{ token: market.baseToken }"
        />
      </div>

      <div>
        {{ market.ticker }}
      </div>
    </div>

    <div class="flex items-center justify-end">
      <span>{{ lowerBoundToString }} {{ market.quoteToken.symbol }}</span>
    </div>

    <div class="flex items-center justify-end">
      <span>{{ upperBoundToString }} {{ market.quoteToken.symbol }}</span>
    </div>

    <div class="flex items-center justify-end break-words font-semibold">
      <div>{{ totalInvestmentToString }} USD</div>
    </div>

    <div
      class="flex items-center justify-end break-words font-semibold"
      :class="[pnl.gte(0) ? 'text-green-500' : 'text-red-500']"
    >
      <div>
        <div>
          {{ pnlToString }}
          {{ market.quoteToken.symbol }}
        </div>
        <div>{{ percentagePnl }} %</div>
      </div>
    </div>

    <div class="flex items-center justify-end">{{ duration }}</div>

    <div class="flex items-center justify-center">
      <div
        class="underline hover:text-blue-500 cursor-pointer"
        @click.prevent="onDetailsPage"
      >
        {{ $t('sgt.details') }}
      </div>
    </div>

    <div class="flex items-center justify-center" @click.prevent.stop>
      <PartialsCommonCancelButton
        v-bind="{ status }"
        @click="onRemoveStrategy"
      />
    </div>
  </NuxtLink>
</template>
