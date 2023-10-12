<script setup lang="ts">
import { format } from 'date-fns'
import { BigNumberInWei } from '@injectivelabs/utils'
import { UiSpotMarketWithToken, ZERO_IN_BASE } from '@injectivelabs/sdk-ui-ts'
import { PropType } from 'nuxt/dist/app/compat/capi'
import { TradingStrategy } from '@injectivelabs/sdk-ts'
import {
  addressAndMarketSlugToSubaccountId,
  durationFormatter
} from '@/app/utils/helpers'
import { UI_DEFAULT_MIN_DISPLAY_DECIMALS } from '@/app/utils/constants'
import { StrategyStatus } from '@/types'

const props = defineProps({
  activeStrategy: {
    type: Object as PropType<TradingStrategy>,
    required: true
  },

  market: {
    type: Object as PropType<UiSpotMarketWithToken>,
    required: true
  }
})

const walletStore = useWalletStore()

const { aggregatedPortfolioBalances } = useBalance()

const market = computed(() => props.market)

const { percentagePnl, pnl } = useActiveGridStrategy(
  market,
  computed(() => props.activeStrategy)
)

const {
  stopLoss,
  lowerBound,
  upperBound,
  takeProfit,
  creationExecutionPrice,
  subscriptionBaseQuantity,
  subscriptionQuoteQuantity
} = useActiveGridStrategyTransformer(
  market,
  computed(() => props.activeStrategy)
)

const now = ref(Date.now())

const marketSubaccountId = computed(() =>
  addressAndMarketSlugToSubaccountId(walletStore.address, market.value.slug)
)

const subaccountBalances = computed(
  () => aggregatedPortfolioBalances.value[marketSubaccountId.value]
)

const currentBaseBalance = computed(() => {
  if (!subaccountBalances.value) {
    return ZERO_IN_BASE
  }

  return new BigNumberInWei(
    subaccountBalances.value.find(
      (balance) => balance.denom === market.value.baseDenom
    )?.totalBalance || 0
  ).toBase(market.value.baseToken.decimals)
})

const currentQuoteBalance = computed(() => {
  if (!subaccountBalances.value) {
    return ZERO_IN_BASE
  }

  return new BigNumberInWei(
    subaccountBalances.value.find(
      (balance) => balance.denom === market.value.quoteDenom
    )?.accountTotalBalanceInUsd || 0
  ).toBase(market.value.quoteToken.decimals)
})

const accountTotalBalanceInUsd = computed(() =>
  subaccountBalances.value.reduce(
    (total, balance) =>
      total.plus(
        new BigNumberInWei(balance.accountTotalBalanceInUsd).toBase(
          balance.token.decimals
        )
      ),
    ZERO_IN_BASE
  )
)

const createdAtFormatted = computed(() =>
  format(new Date(Number(props.activeStrategy.createdAt)), 'dd MMM HH:mm:ss')
)

const durationFormatted = computed(() =>
  durationFormatter(
    props.activeStrategy.createdAt,
    props.activeStrategy.state === StrategyStatus.Active
      ? now.value
      : props.activeStrategy.updatedAt
  )
)

const { valueToString: currentBaseBalanceToString } = useBigNumberFormatter(
  currentBaseBalance,
  {
    decimalPlaces: UI_DEFAULT_MIN_DISPLAY_DECIMALS
  }
)

const { valueToString: currentQuoteBalanceToString } = useBigNumberFormatter(
  currentQuoteBalance,
  {
    decimalPlaces: UI_DEFAULT_MIN_DISPLAY_DECIMALS
  }
)

const { valueToString: totalAmountToString } = useBigNumberFormatter(
  accountTotalBalanceInUsd,
  { decimalPlaces: UI_DEFAULT_MIN_DISPLAY_DECIMALS }
)

const { valueToString: upperBoundtoString } = useBigNumberFormatter(
  upperBound,
  { decimalPlaces: UI_DEFAULT_MIN_DISPLAY_DECIMALS }
)

const { valueToString: lowerBoundtoString } = useBigNumberFormatter(
  lowerBound,
  { decimalPlaces: UI_DEFAULT_MIN_DISPLAY_DECIMALS }
)

const { valueToString: creationExecutionPriceToString } = useBigNumberFormatter(
  creationExecutionPrice,
  { decimalPlaces: UI_DEFAULT_MIN_DISPLAY_DECIMALS }
)

const { valueToString: pnltoString } = useBigNumberFormatter(pnl, {
  decimalPlaces: UI_DEFAULT_MIN_DISPLAY_DECIMALS
})

const { valueToString: creationBaseQuantityToString } = useBigNumberFormatter(
  subscriptionBaseQuantity,
  { decimalPlaces: UI_DEFAULT_MIN_DISPLAY_DECIMALS }
)

const { valueToString: creationQuoteQuantitytoString } = useBigNumberFormatter(
  subscriptionQuoteQuantity,
  {
    decimalPlaces: UI_DEFAULT_MIN_DISPLAY_DECIMALS
  }
)

const { valueToString: stopLossToString } = useBigNumberFormatter(stopLoss, {
  decimalPlaces: UI_DEFAULT_MIN_DISPLAY_DECIMALS
})

const { valueToString: takeProfitToString } = useBigNumberFormatter(
  takeProfit,
  { decimalPlaces: UI_DEFAULT_MIN_DISPLAY_DECIMALS }
)

useIntervalFn(() => {
  now.value = Date.now()
}, 1000 * 60)
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-2">
      <p class="font-bold text-lg">{{ $t('sgt.gridDetails') }}</p>
      <div class="flex items-center">
        <div
          class="w-2 h-2 rounded-full mr-2"
          :class="[
            activeStrategy.state === StrategyStatus.Active
              ? 'bg-green-500'
              : 'bg-red-500'
          ]"
        />
        <p v-if="activeStrategy.state === StrategyStatus.Active">
          {{ $t('sgt.running') }}
        </p>
        <p v-else>{{ $t('sgt.removed') }}</p>
      </div>
    </div>

    <div class="flex justify-between mb-2">
      <p class="text-gray-400 text-sm">{{ $t('sgt.totalProfit') }}</p>
      <div
        class="text-right font-bold text-lg"
        :class="[pnl.isPositive() ? 'text-green-500' : 'text-red-500']"
      >
        <p>{{ pnltoString }} {{ market?.quoteToken.symbol }}</p>
        <p>{{ percentagePnl }} %</p>
      </div>
    </div>

    <div class="flex items-center justify-between mb-2">
      <p class="text-gray-400 text-sm flex items-center space-x-2">
        <span>{{ $t('sgt.totalAmount') }}</span>
        <AppTooltip
          :content="
            $t('sgt.totalAmountTooltip', {
              symbol: market.quoteToken.symbol
            })
          "
        />
      </p>
      <p>{{ totalAmountToString }} {{ market?.quoteToken.symbol }}</p>
    </div>

    <div class="flex items-start justify-between mb-2">
      <p class="text-gray-400 text-sm flex items-center space-x-2">
        <span>{{ $t('sgt.currentBalance') }}</span>

        <AppTooltip
          :content="
            $t('sgt.currentBalanceTooltip', {
              quoteSymbol: market.quoteToken.symbol,
              baseSymbol: market.baseToken.symbol
            })
          "
        />
      </p>
      <div class="text-right">
        <p>{{ currentBaseBalanceToString }} {{ market?.baseToken.symbol }}</p>

        <p>{{ currentQuoteBalanceToString }} {{ market?.quoteToken.symbol }}</p>
      </div>
    </div>

    <div class="border-t border-gray-700 my-4" />

    <div class="flex items-center justify-between mb-2">
      <p class="text-gray-400 text-sm">{{ $t('sgt.timeCreated') }}</p>

      <p class="text-sm">{{ createdAtFormatted }}</p>
    </div>

    <div class="flex items-center justify-between mb-2">
      <p class="text-gray-400">{{ $t('sgt.duration') }}</p>

      <p class="text-sm">{{ durationFormatted }}</p>
    </div>

    <div class="flex justify-between mb-2">
      <p class="text-gray-400 text-sm">{{ $t('sgt.priceRange') }}</p>
      <div class="text-right text-sm">
        <p>{{ lowerBoundtoString }} {{ market?.quoteToken.symbol }}</p>

        <p>{{ upperBoundtoString }} {{ market?.quoteToken.symbol }}</p>
      </div>
    </div>

    <div class="flex justify-between mb-2">
      <p class="text-gray-400 text-sm flex items-center self-start space-x-2">
        <span>{{ $t('sgt.initialAmount') }}</span>

        <AppTooltip
          :content="
            $t('sgt.initialInvestmentTooltip', {
              quoteSymbol: market.quoteToken.symbol,
              baseSymbol: market.baseToken.symbol
            })
          "
        />
      </p>
      <div class="text-right">
        <p>{{ creationBaseQuantityToString }} {{ market?.baseToken.symbol }}</p>

        <p>
          {{ creationQuoteQuantitytoString }} {{ market?.quoteToken.symbol }}
        </p>
      </div>
    </div>

    <div class="flex items-center justify-between mb-2">
      <p class="text-gray-400 text-sm flex items-center space-x-2">
        <span>{{ $t('sgt.initialEntryPrice') }}</span>
        <AppTooltip :content="$t('sgt.initialEntryTooltip')" />
      </p>

      <p>
        {{ creationExecutionPriceToString }} {{ market?.quoteToken.symbol }}
      </p>
    </div>

    <div class="flex items-center justify-between mb-2">
      <p class="text-gray-400 text-sm flex items-center space-x-2">
        <span>{{ $t('sgt.numberOfGrids') }}</span>
        <AppTooltip :content="$t('sgt.initialEntryTooltip')" />
      </p>

      <p>
        {{ activeStrategy.numberOfGridLevels }}
      </p>
    </div>

    <div class="border-t border-gray-700 my-4" />

    <div class="flex justify-between mb-2">
      <p class="text-gray-400 text-sm flex items-center space-x-2">
        <span>{{ $t('sgt.stopLoss') }}</span>
        <AppTooltip :content="$t('sgt.stopLossTooltip')" />
      </p>

      <p v-if="stopLoss.eq(0)">-</p>
      <p v-else>{{ stopLossToString }} {{ market?.quoteToken.symbol }}</p>
    </div>

    <div class="flex justify-between mb-2">
      <p class="text-gray-400 text-sm flex items-center space-x-2">
        <span>{{ $t('sgt.takeProfit') }}</span>
        <AppTooltip :content="$t('sgt.takeProfitTooltip')" />
      </p>

      <p v-if="takeProfit.eq(0)">-</p>
      <p v-else>{{ takeProfitToString }} {{ market?.quoteToken.symbol }}</p>
    </div>

    <!-- <div class="flex justify-between mb-2"> WE REMOVE THIS FOR NOW SINCE ADDITIONAL SUPPORT FROM SC IS NEEDED
      <p class="text-gray-400 text-sm flex items-center space-x-2">
        <span>{{ $t('sgt.sellAllBaseOnStop') }}</span>
        <AppTooltip
          :content="
            $t('sgt.sellAllBaseOnStopTooltip', {
              symbol: market.baseToken.symbol
            })
          "
        />
      </p>

      <p>
        {{
          $t(
            activeStrategy.shouldExitWithQuoteOnly
              ? 'sgt.enabled'
              : 'sgt.disabled'
          )
        }}
      </p>
    </div> -->
  </div>
</template>
