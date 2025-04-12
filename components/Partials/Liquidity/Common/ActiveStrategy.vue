<script lang="ts" setup>
import { format } from 'date-fns'
import { ZERO_IN_BASE } from '@shared/utils/constant'
import { sharedToBalanceInTokenInBase } from '@shared/utils/formatter'
import { ExitType, TradingStrategy } from '@injectivelabs/sdk-ts'
import {
  GST_AUTO_PRICE_THRESHOLD,
  UI_DEFAULT_MAX_DISPLAY_DECIMALS,
  UI_DEFAULT_MIN_DISPLAY_DECIMALS
} from '@/app/utils/constants'
import { durationFormatter } from '@/app/utils/helpers'
import { StopReason, StrategyStatus, UiSpotMarket } from '@/types'
import { IndexerGridStrategyType } from '@/types/grid'

const { subaccountPortfolioBalanceMap } = useBalance()

const props = withDefaults(
  defineProps<{
    market: UiSpotMarket
    isLiquidity?: boolean
    activeStrategy: TradingStrategy
  }>(),
  {}
)

const { percentagePnl, pnl, investment, marketSubaccountBalances } =
  useActiveGridStrategy(
    computed(() => props.market),
    computed(() => props.activeStrategy),
    subaccountPortfolioBalanceMap
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
  computed(() => props.market),
  computed(() => props.activeStrategy)
)

const now = ref(Date.now())

const accountTotalBalanceInUsd = computed(() =>
  (marketSubaccountBalances.value || []).reduce(
    (total, balance) => total.plus(balance.totalBalanceInUsd),
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
  () => props.activeStrategy.strategyType === IndexerGridStrategyType.Geometric
)

const totalAmount = computed(() => {
  return props.activeStrategy.state === StrategyStatus.Active
    ? accountTotalBalanceInUsd.value
    : investment.value
})

const currentBaseBalance = computed(() => {
  if (!marketSubaccountBalances.value) {
    return ZERO_IN_BASE
  }

  return sharedToBalanceInTokenInBase({
    value:
      marketSubaccountBalances.value.find(
        (balance) => balance.denom === props.market.baseDenom
      )?.totalBalance || 0,
    decimalPlaces: props.market.baseToken.decimals
  })
})

const currentQuoteBalance = computed(() => {
  if (!marketSubaccountBalances.value) {
    return ZERO_IN_BASE
  }

  return sharedToBalanceInTokenInBase({
    value:
      marketSubaccountBalances.value.find(
        (balance) => balance.denom === props.market.quoteDenom
      )?.totalBalance || 0,
    decimalPlaces: props.market.quoteToken.decimals
  })
})

useIntervalFn(() => {
  now.value = Date.now()
}, 1000 * 60)
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-2">
      <p class="font-bold text-lg text-white">{{ $t('sgt.gridDetails') }}</p>
      <div class="flex items-center text-white">
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
      <p class="text-coolGray-450">{{ $t('sgt.totalProfit') }}</p>
      <div
        class="text-right"
        :class="[pnl.isPositive() ? 'text-green-500' : 'text-red-500']"
      >
        <span class="font-semibold text-lg">
          <AppAmount
            v-bind="{
              amount: pnl.toFixed(),
              decimalPlaces: UI_DEFAULT_MIN_DISPLAY_DECIMALS
            }"
            class="text-white"
          />
          <span class="text-xs align-text-bottom ml-1 text-coolGray-450">
            {{ market?.quoteToken.symbol }}
          </span>
        </span>
        <span class="text-xs opacity-75 ml-1"> ({{ percentagePnl }}%) </span>
      </div>
    </div>

    <div class="flex items-center justify-between mb-2 text-sm">
      <span class="text-coolGray-450 flex items-center space-x-2">
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
        <AppUsdAmount
          v-bind="{
            amount: totalAmount.toFixed(),
            decimalPlaces: UI_DEFAULT_MIN_DISPLAY_DECIMALS
          }"
          class="text-white"
        />
        <span
          class="text-xs opacity-75 align-text-bottom ml-1 text-coolGray-450"
        >
          USD
        </span>
      </span>
    </div>

    <div class="flex items-start justify-between mb-2 text-sm">
      <p class="text-coolGray-450 flex items-center space-x-2">
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
        <PartialsLiquidityCommonDetailsPair
          v-if="activeStrategy.state === StrategyStatus.Active"
          :market="market"
        >
          <template #base>
            <AppAmount
              v-bind="{
                amount: currentBaseBalance.toFixed(),
                decimalPlaces: UI_DEFAULT_MIN_DISPLAY_DECIMALS
              }"
              class="text-white"
            />
          </template>
          <template #quote>
            <AppAmount
              v-bind="{
                amount: currentQuoteBalance.toFixed(),
                decimalPlaces: UI_DEFAULT_MIN_DISPLAY_DECIMALS
              }"
              class="text-white"
            />
          </template>
        </PartialsLiquidityCommonDetailsPair>

        <PartialsLiquidityCommonDetailsPair v-else :market="market">
          <template #base>
            <AppAmount
              v-bind="{
                amount: stopBaseQuantity.toFixed(),
                decimalPlaces: UI_DEFAULT_MIN_DISPLAY_DECIMALS
              }"
              class="text-white"
            />
          </template>
          <template #quote>
            <AppAmount
              v-bind="{
                amount: stopQuoteQuantity.toFixed(),
                decimalPlaces: UI_DEFAULT_MIN_DISPLAY_DECIMALS
              }"
              class="text-white"
            />
          </template>
        </PartialsLiquidityCommonDetailsPair>
      </div>
    </div>

    <div class="border-t border-coolGray-700 my-4" />

    <div class="flex items-center justify-between mb-2">
      <p class="text-coolGray-450 text-sm">{{ $t('sgt.timeCreated') }}</p>
      <p class="text-sm text-white">{{ createdAtFormatted }}</p>
    </div>

    <div class="flex items-center justify-between mb-2 text-sm">
      <span class="text-coolGray-450">{{ $t('sgt.duration') }}</span>
      <span class="text-white">{{ durationFormatted }}</span>
    </div>

    <div class="border-t border-coolGray-800 my-4" />

    <div class="flex justify-between mb-2 text-sm">
      <p class="text-coolGray-450">{{ $t('sgt.priceRange') }}</p>
      <div class="text-right">
        <PartialsLiquidityCommonDetailsPair
          v-bind="{
            baseSymbol: market.quoteToken.symbol,
            quoteSymbol: market.quoteToken.symbol
          }"
        >
          <template #base>
            <AppAmount
              v-bind="{
                amount: lowerBound.toFixed(),
                decimalPlaces: lowerBound.lt(GST_AUTO_PRICE_THRESHOLD)
                  ? UI_DEFAULT_MAX_DISPLAY_DECIMALS
                  : UI_DEFAULT_MIN_DISPLAY_DECIMALS
              }"
              class="text-white"
            />
          </template>
          <template #quote>
            <AppAmount
              v-bind="{
                amount: upperBound.toFixed(),
                decimalPlaces: upperBound.lt(GST_AUTO_PRICE_THRESHOLD)
                  ? UI_DEFAULT_MAX_DISPLAY_DECIMALS
                  : UI_DEFAULT_MIN_DISPLAY_DECIMALS
              }"
              class="text-white"
            />
          </template>
        </PartialsLiquidityCommonDetailsPair>
      </div>
    </div>

    <div class="flex justify-between mb-2 text-sm">
      <p class="text-coolGray-450 flex items-center self-start space-x-2">
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
        <PartialsLiquidityCommonDetailsPair v-bind="{ market }">
          <template #base>
            <AppAmount
              v-bind="{
                amount: subscriptionBaseQuantity.toFixed(),
                decimalPlaces: UI_DEFAULT_MIN_DISPLAY_DECIMALS
              }"
              class="text-white"
            />
          </template>
          <template #quote>
            <AppAmount
              v-bind="{
                amount: subscriptionQuoteQuantity.toFixed(),
                decimalPlaces: UI_DEFAULT_MIN_DISPLAY_DECIMALS
              }"
              class="text-white"
            />
          </template>
        </PartialsLiquidityCommonDetailsPair>
      </div>
    </div>

    <div class="flex items-center justify-between mb-2 text-sm">
      <span class="text-coolGray-450 flex items-center space-x-2">
        <span>{{ $t('sgt.initialEntryPrice') }}</span>
        <AppTooltip :content="$t('sgt.initialEntryTooltip')" />
      </span>
      <span>
        <AppAmount
          v-bind="{
            amount: creationExecutionPrice.toFixed(),
            decimalPlaces: UI_DEFAULT_MIN_DISPLAY_DECIMALS
          }"
          class="text-white"
        />
        <span
          class="text-xs opacity-75 align-text-bottom ml-1 text-coolGray-450"
        >
          {{ market?.quoteToken.symbol }}
        </span>
      </span>
    </div>

    <div class="flex items-center justify-between mb-2 text-sm">
      <span class="text-coolGray-450 flex items-center space-x-2">
        <span>{{ $t('sgt.numberOfGrids') }}</span>
        <AppTooltip :content="$t('sgt.nOfGridsTooltip')" />
      </span>
      <span class="text-white">
        {{ activeStrategy.numberOfGridLevels }}
      </span>
    </div>

    <div class="flex items-center justify-between mb-2 text-sm">
      <span class="text-coolGray-450 flex items-center space-x-2">
        <span>{{ $t('sgt.gridMode') }}</span>
        <AppTooltip :content="$t('sgt.gridModeTooltip')" />
      </span>

      <span v-if="isGeometric" class="text-white">
        {{ $t('sgt.geometric') }}
      </span>
      <span v-else class="text-white">
        {{ $t('sgt.arithmetic') }}
      </span>
    </div>

    <div class="border-t border-coolGray-800 my-4" />

    <div class="pb-4">
      <div class="flex justify-between mb-4 text-sm">
        <span class="text-coolGray-450 flex items-center space-x-2">
          <span>{{ $t('sgt.advanced.settleIn') }}</span>
        </span>

        <span class="text-white">
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
        <span class="text-coolGray-450 flex items-center space-x-2">
          <span>{{ $t('sgt.stopLoss') }}</span>
          <AppTooltip :content="$t('sgt.stopLossTooltip')" />
        </span>

        <span class="text-white">
          {{
            activeStrategy.stopLossConfig
              ? $t('sgt.enabled')
              : $t('sgt.disabled')
          }}
        </span>
      </div>

      <div v-if="activeStrategy.stopLossConfig">
        <div class="flex justify-between mb-2 text-sm">
          <span class="text-coolGray-450 flex items-center space-x-2">
            <span> &mdash; {{ $t('sgt.advanced.stopLossPrice') }}</span>
          </span>

          <span>
            <span>
              <AppAmount
                v-bind="{
                  amount: stopLoss.toFixed(),
                  decimalPlaces: UI_DEFAULT_MIN_DISPLAY_DECIMALS
                }"
                class="text-white"
              />
            </span>

            <span class="ml-1 text-coolGray-450">
              {{ market?.quoteToken.symbol }}
            </span>
          </span>
        </div>

        <div class="flex justify-between mb-2 text-sm">
          <span class="text-coolGray-450 flex items-center space-x-2">
            <span>
              &mdash;
              {{
                $t('sgt.advanced.sellAllOnStop', {
                  symbol: market.baseToken.symbol
                })
              }}
            </span>
          </span>

          <span class="text-white">
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
        <span class="text-coolGray-450 flex items-center space-x-2">
          <span>{{ $t('sgt.takeProfit') }}</span>
          <AppTooltip :content="$t('sgt.takeProfitTooltip')" />
        </span>

        <span class="text-white">
          {{
            activeStrategy.takeProfitConfig
              ? $t('sgt.enabled')
              : $t('sgt.disabled')
          }}
        </span>
      </div>

      <div v-if="activeStrategy.takeProfitConfig">
        <div class="flex justify-between mb-2 text-sm">
          <span class="text-coolGray-450 flex items-center space-x-2">
            <span> &mdash; {{ $t('sgt.advanced.takeProfitPrice') }}</span>
          </span>

          <span>
            <span>
              <AppAmount
                v-bind="{
                  amount: takeProfit.toFixed(),
                  decimalPlaces: UI_DEFAULT_MIN_DISPLAY_DECIMALS
                }"
                class="text-white"
              />
            </span>

            <span class="ml-1 text-coolGray-450">
              {{ market?.quoteToken.symbol }}
            </span>
          </span>
        </div>

        <div class="flex justify-between mb-2 text-sm">
          <span class="text-coolGray-450 flex items-center space-x-2">
            <span>
              &mdash;
              {{
                $t('sgt.advanced.buyBaseOnStop', {
                  symbol: market.baseToken.symbol
                })
              }}
            </span>
          </span>

          <span class="text-white">
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

    <PartialsLiquidityCommonFormEndBot
      v-if="activeStrategy.state === StrategyStatus.Active"
      v-bind="{ isLiquidity, strategy: activeStrategy }"
    />
  </div>
</template>
