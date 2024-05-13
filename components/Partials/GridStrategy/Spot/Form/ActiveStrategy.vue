<script lang="ts" setup>
import { format } from 'date-fns'
import { BigNumberInWei } from '@injectivelabs/utils'
import { ZERO_IN_BASE } from '@shared/utils/constant'
import { ExitType, StrategyType, TradingStrategy } from '@injectivelabs/sdk-ts'
import {
  GST_AUTO_PRICE_THRESHOLD,
  UI_DEFAULT_MAX_DISPLAY_DECIMALS,
  UI_DEFAULT_MIN_DISPLAY_DECIMALS
} from '@/app/utils/constants'
import {
  durationFormatter,
  addressAndMarketSlugToSubaccountId
} from '@/app/utils/helpers'
import { StopReason, UiSpotMarket, StrategyStatus } from '@/types'

const props = defineProps({
  isLiquidity: Boolean,

  activeStrategy: {
    type: Object as PropType<TradingStrategy>,
    required: true
  },

  market: {
    type: Object as PropType<UiSpotMarket>,
    required: true
  }
})

const walletStore = useWalletStore()

const { aggregatedPortfolioBalances } = useBalance()

const market = computed(() => props.market)

const { percentagePnl, pnl, investment } = useActiveGridStrategy(
  market,
  computed(() => props.activeStrategy)
)

const {
  stopLoss,
  lowerBound,
  upperBound,
  takeProfit,
  stopBaseQuantity,
  stopQuoteQuantity,
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

const isGeometric = computed(
  () => props.activeStrategy.strategyType === StrategyType.Geometric
)

const { valueToString: currentBaseBalanceToString } =
  useSharedBigNumberFormatter(
    computed(() => {
      if (!subaccountBalances.value) {
        return ZERO_IN_BASE
      }
      return new BigNumberInWei(
        subaccountBalances.value.find(
          (balance) => balance.denom === market.value.baseDenom
        )?.totalBalance || 0
      ).toBase(market.value.baseToken.decimals)
    })
  )

const { valueToString: currentQuoteBalanceToString } =
  useSharedBigNumberFormatter(
    computed(() => {
      if (!subaccountBalances.value) {
        return ZERO_IN_BASE
      }
      return new BigNumberInWei(
        subaccountBalances.value.find(
          (balance) => balance.denom === market.value.quoteDenom
        )?.accountTotalBalance || 0
      ).toBase(market.value.quoteToken.decimals)
    })
  )

const { valueToString: stopBaseQuantityToString } = useSharedBigNumberFormatter(
  stopBaseQuantity,
  {
    decimalPlaces: UI_DEFAULT_MIN_DISPLAY_DECIMALS
  }
)

const { valueToString: stopQuoteQuantityToString } =
  useSharedBigNumberFormatter(stopQuoteQuantity, {
    decimalPlaces: UI_DEFAULT_MIN_DISPLAY_DECIMALS
  })

const { valueToString: totalAmountToString } = useSharedBigNumberFormatter(
  props.activeStrategy.state === StrategyStatus.Active
    ? accountTotalBalanceInUsd
    : investment,
  { decimalPlaces: UI_DEFAULT_MIN_DISPLAY_DECIMALS }
)

const { valueToString: upperBoundToString } = useSharedBigNumberFormatter(
  upperBound,
  {
    decimalPlaces: upperBound.value.lt(GST_AUTO_PRICE_THRESHOLD)
      ? UI_DEFAULT_MAX_DISPLAY_DECIMALS
      : UI_DEFAULT_MIN_DISPLAY_DECIMALS
  }
)

const { valueToString: lowerBoundToString } = useSharedBigNumberFormatter(
  lowerBound,
  {
    decimalPlaces: lowerBound.value.lt(GST_AUTO_PRICE_THRESHOLD)
      ? UI_DEFAULT_MAX_DISPLAY_DECIMALS
      : UI_DEFAULT_MIN_DISPLAY_DECIMALS
  }
)

const { valueToString: creationExecutionPriceToString } =
  useSharedBigNumberFormatter(creationExecutionPrice, {
    decimalPlaces: UI_DEFAULT_MIN_DISPLAY_DECIMALS
  })

const { valueToString: pnlToString } = useSharedBigNumberFormatter(pnl, {
  decimalPlaces: UI_DEFAULT_MIN_DISPLAY_DECIMALS
})

const { valueToString: creationBaseQuantityToString } =
  useSharedBigNumberFormatter(subscriptionBaseQuantity, {
    decimalPlaces: UI_DEFAULT_MIN_DISPLAY_DECIMALS
  })
const { valueToString: creationQuoteQuantityToString } =
  useSharedBigNumberFormatter(subscriptionQuoteQuantity, {
    decimalPlaces: UI_DEFAULT_MIN_DISPLAY_DECIMALS
  })

const { valueToString: stopLossToString } = useSharedBigNumberFormatter(
  stopLoss,
  {
    decimalPlaces: UI_DEFAULT_MIN_DISPLAY_DECIMALS
  }
)

const { valueToString: takeProfitToString } = useSharedBigNumberFormatter(
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
        <p v-else class="space-x-1">
          <span>{{ $t('sgt.removed') }}</span>
          <span>
            <span v-if="activeStrategy.stopReason === StopReason.User">
              ({{ $t('sgt.user') }})
            </span>

            <span v-if="activeStrategy.stopReason === StopReason.StopLoss">
              ({{ $t('sgt.stopLoss') }})
            </span>

            <span v-if="activeStrategy.stopReason === StopReason.TakeProfit">
              ({{ $t('sgt.takeProfit') }})
            </span>

            <span
              v-if="activeStrategy.stopReason === StopReason.InsufficientFunds"
            >
              ({{ $t('sgt.insufficientFunds') }})
            </span>
            <span
              v-if="activeStrategy.stopReason === StopReason.ExceededMaxRetries"
            >
              ({{ $t('sgt.exceededMaxRetries') }})
            </span>

            <span v-if="activeStrategy.stopReason === StopReason.Emergency">
              {{ $t('sgt.marketConditionsNotSupported') }}
            </span>
          </span>
        </p>
      </div>
    </div>

    <div class="flex justify-between mb-2 text-sm">
      <p class="text-gray-400">{{ $t('sgt.totalProfit') }}</p>
      <div
        class="text-right"
        :class="[pnl.isPositive() ? 'text-green-500' : 'text-red-500']"
      >
        <span class="font-semibold text-lg">
          {{ pnlToString }}
          <span class="text-xs align-text-bottom ml-1">
            {{ market?.quoteToken.symbol }}
          </span>
        </span>
        <span class="text-2xs opacity-75 ml-1">({{ percentagePnl }} %)</span>
      </div>
    </div>

    <div class="flex items-center justify-between mb-2 text-sm">
      <span class="text-gray-400 flex items-center space-x-2">
        <span>{{ $t('sgt.totalAmount') }}</span>
        <AppTooltip
          :content="
            $t('sgt.totalAmountTooltip', {
              symbol: market.quoteToken.symbol
            })
          "
        />
      </span>

      <span>
        {{ totalAmountToString }}
        <span class="text-xs opacity-75 align-text-bottom ml-1">USD</span>
      </span>
    </div>

    <div class="flex items-start justify-between mb-2 text-sm">
      <p class="text-gray-400 flex items-center space-x-2">
        <template v-if="activeStrategy.state === StrategyStatus.Active">
          <span>{{ $t('sgt.currentBalance') }}</span>
          <AppTooltip
            :content="
              $t('sgt.currentBalanceTooltip', {
                quoteSymbol: market.quoteToken.symbol,
                baseSymbol: market.baseToken.symbol
              })
            "
          />
        </template>
        <template v-else>
          <span>{{ $t('sgt.finalBalance') }}</span>
          <AppTooltip
            :content="
              $t('sgt.finalBalanceTooltip', {
                quoteSymbol: market.quoteToken.symbol,
                baseSymbol: market.baseToken.symbol
              })
            "
          />
        </template>
      </p>

      <div class="text-right">
        <PartialsGridStrategySpotCommonDetailsPair
          v-if="activeStrategy.state === StrategyStatus.Active"
          :market="market"
        >
          <template #base>{{ currentBaseBalanceToString }}</template>
          <template #quote>{{ currentQuoteBalanceToString }}</template>
        </PartialsGridStrategySpotCommonDetailsPair>

        <PartialsGridStrategySpotCommonDetailsPair v-else :market="market">
          <template #base>{{ stopBaseQuantityToString }}</template>
          <template #quote>{{ stopQuoteQuantityToString }}</template>
        </PartialsGridStrategySpotCommonDetailsPair>
      </div>
    </div>

    <div class="border-t border-gray-700 my-4" />

    <div class="flex items-center justify-between mb-2">
      <p class="text-gray-400 text-sm">{{ $t('sgt.timeCreated') }}</p>
      <p class="text-sm">{{ createdAtFormatted }}</p>
    </div>

    <div class="flex items-center justify-between mb-2 text-sm">
      <span class="text-gray-400">{{ $t('sgt.duration') }}</span>
      <span>{{ durationFormatted }}</span>
    </div>

    <div class="border-t border-gray-800 my-4" />

    <div class="flex justify-between mb-2 text-sm">
      <p class="text-gray-400">{{ $t('sgt.priceRange') }}</p>
      <div class="text-right">
        <PartialsGridStrategySpotCommonDetailsPair
          v-bind="{
            baseSymbol: market.quoteToken.symbol,
            quoteSymbol: market.quoteToken.symbol
          }"
        >
          <template #base>{{ lowerBoundToString }}</template>
          <template #quote>{{ upperBoundToString }}</template>
        </PartialsGridStrategySpotCommonDetailsPair>
      </div>
    </div>

    <div class="flex justify-between mb-2 text-sm">
      <p class="text-gray-400 flex items-center self-start space-x-2">
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
        <PartialsGridStrategySpotCommonDetailsPair v-bind="{ market }">
          <template #base>{{ creationBaseQuantityToString }}</template>
          <template #quote>{{ creationQuoteQuantityToString }}</template>
        </PartialsGridStrategySpotCommonDetailsPair>
      </div>
    </div>

    <div class="flex items-center justify-between mb-2 text-sm">
      <span class="text-gray-400 flex items-center space-x-2">
        <span>{{ $t('sgt.initialEntryPrice') }}</span>
        <AppTooltip :content="$t('sgt.initialEntryTooltip')" />
      </span>
      <span>
        {{ creationExecutionPriceToString }}
        <span class="text-xs opacity-75 align-text-bottom ml-1">{{
          market?.quoteToken.symbol
        }}</span>
      </span>
    </div>

    <div class="flex items-center justify-between mb-2 text-sm">
      <span class="text-gray-400 flex items-center space-x-2">
        <span>{{ $t('sgt.numberOfGrids') }}</span>
        <AppTooltip :content="$t('sgt.nOfGridsTooltip')" />
      </span>
      <span>
        {{ activeStrategy.numberOfGridLevels }}
      </span>
    </div>

    <div class="flex items-center justify-between mb-2 text-sm">
      <span class="text-gray-400 flex items-center space-x-2">
        <span>{{ $t('sgt.gridMode') }}</span>
        <AppTooltip :content="$t('sgt.gridModeTooltip')" />
      </span>

      <span v-if="isGeometric">
        {{ $t('sgt.geometric') }}
      </span>
      <span v-else>
        {{ $t('sgt.arithmetic') }}
      </span>
    </div>

    <div class="border-t border-gray-800 my-4" />

    <div class="pb-4">
      <div class="flex justify-between mb-4 text-sm">
        <span class="text-gray-400 flex items-center space-x-2">
          <span>{{ $t('sgt.advanced.settleIn') }}</span>
        </span>

        <span>
          <span v-if="activeStrategy.exitType === ExitType.Quote">
            {{ market.quoteToken.symbol }}
          </span>
          <span v-else-if="activeStrategy.exitType === ExitType.Base">
            {{ market.baseToken.symbol }}
          </span>
          <span v-else>
            {{ $t('sgt.advanced.disabled') }}
          </span>
        </span>
      </div>

      <div class="flex justify-between mb-2 text-sm">
        <span class="text-gray-400 flex items-center space-x-2">
          <span>{{ $t('sgt.stopLoss') }}</span>
          <AppTooltip :content="$t('sgt.stopLossTooltip')" />
        </span>

        <span>
          {{
            activeStrategy.stopLossConfig
              ? $t('sgt.enabled')
              : $t('sgt.disabled')
          }}
        </span>
      </div>

      <div v-if="activeStrategy.stopLossConfig">
        <div class="flex justify-between mb-2 text-sm">
          <span class="text-gray-400 flex items-center space-x-2">
            <span> &mdash; {{ $t('sgt.advanced.stopLossPrice') }}</span>
          </span>

          <span>
            <span>{{ stopLossToString }} </span>

            <span class="ml-1">
              {{ market?.quoteToken.symbol }}
            </span>
          </span>
        </div>

        <div class="flex justify-between mb-2 text-sm">
          <span class="text-gray-400 flex items-center space-x-2">
            <span>
              &mdash;
              {{
                $t('sgt.advanced.sellAllOnStop', {
                  symbol: market.baseToken.symbol
                })
              }}
            </span>
          </span>

          <span>
            <span
              v-if="activeStrategy.stopLossConfig.exitType === ExitType.Quote"
            >
              {{ $t('sgt.advanced.enabled') }}
            </span>
            <span v-else>
              {{ $t('sgt.advanced.disabled') }}
            </span>
          </span>
        </div>
      </div>

      <div class="flex justify-between mb-2 text-sm">
        <span class="text-gray-400 flex items-center space-x-2">
          <span>{{ $t('sgt.takeProfit') }}</span>
          <AppTooltip :content="$t('sgt.takeProfitTooltip')" />
        </span>

        <span>
          {{
            activeStrategy.takeProfitConfig
              ? $t('sgt.enabled')
              : $t('sgt.disabled')
          }}
        </span>
      </div>

      <div v-if="activeStrategy.takeProfitConfig">
        <div class="flex justify-between mb-2 text-sm">
          <span class="text-gray-400 flex items-center space-x-2">
            <span> &mdash; {{ $t('sgt.advanced.takeProfitPrice') }}</span>
          </span>

          <span>
            <span> {{ takeProfitToString }}</span>

            <span class="ml-1">
              {{ market?.quoteToken.symbol }}
            </span>
          </span>
        </div>

        <div class="flex justify-between mb-2 text-sm">
          <span class="text-gray-400 flex items-center space-x-2">
            <span>
              &mdash;
              {{
                $t('sgt.advanced.buyBaseOnStop', {
                  symbol: market.baseToken.symbol
                })
              }}
            </span>
          </span>

          <span>
            <span
              v-if="activeStrategy.takeProfitConfig.exitType === ExitType.Base"
            >
              {{ $t('sgt.advanced.enabled') }}
            </span>
            <span v-else>
              {{ $t('sgt.advanced.disabled') }}
            </span>
          </span>
        </div>
      </div>
    </div>

    <PartialsGridStrategySpotFormEndBot
      v-if="activeStrategy.state === StrategyStatus.Active"
      v-bind="{ isLiquidity, strategy: activeStrategy }"
    />
  </div>
</template>
