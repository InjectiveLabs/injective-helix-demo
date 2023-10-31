<script lang="ts" setup>
import { MarketType } from '@injectivelabs/sdk-ui-ts'
import { DefaultMarket, TradeClickOrigin } from '@/types'
import { amplitudeTradeTracker } from '@/app/providers/amplitude'
import {
  getDefaultPerpetualMarketRouteParams,
  getDefaultSpotMarketRouteParams
} from '@/app/utils/market'
import { IS_MAINNET, IS_STAGING } from 'app/utils/constants'

const walletStore = useWalletStore()

const defaultPerpetualMarketRoute = getDefaultPerpetualMarketRouteParams()
const defaultSpotMarketRoute = getDefaultSpotMarketRouteParams()

function handleSpotTradeClickedTrack() {
  amplitudeTradeTracker.navigateToTradePageTrackEvent({
    market: DefaultMarket.Spot,
    marketType: MarketType.Spot,
    origin: TradeClickOrigin.TopMenu
  })
}

function handlePerpetualTradeClickedTrack() {
  amplitudeTradeTracker.navigateToTradePageTrackEvent({
    market: DefaultMarket.Perpetual,
    marketType: MarketType.Perpetual,
    origin: TradeClickOrigin.TopMenu
  })
}
</script>

<template>
  <div>
    <nav class="block flex-1 lg:flex">
      <LayoutNavItem :to="{ name: 'index' }" class="block lg:hidden">
        {{ $t('navigation.home') }}
      </LayoutNavItem>

      <LayoutNavItem
        :to="{ name: 'markets' }"
        class="block"
        data-cy="header-markets-link"
      >
        {{ $t('trade.markets') }}
      </LayoutNavItem>

      <LayoutNavHoverMenu>
        <template #default>
          <div class="relative">
            <LayoutNavItemDummy id="trade-dropdown" class="hidden lg:block">
              {{ $t('navigation.trade') }}
            </LayoutNavItemDummy>
          </div>
        </template>

        <template #content>
          <NuxtLink
            :to="{ name: 'swap' }"
            class="p-4 block rounded-b group hover:bg-gray-700 relative z-50 bg-gray-850"
            data-cy="header-swap-link"
          >
            <div class="flex items-center gap-2.5">
              <p class="font-semibold text-base text-white">
                {{ $t('navigation.swap') }}
              </p>
            </div>

            <p class="text-sm text-gray-500 group-hover:text-gray-100 mt-1">
              {{ $t('navigation.swapDescription') }}
            </p>
          </NuxtLink>

          <NuxtLink
            :to="defaultSpotMarketRoute"
            class="p-4 block rounded-t group hover:bg-gray-700 relative z-50 bg-gray-850"
            data-cy="header-trade-link"
            @click="handleSpotTradeClickedTrack"
          >
            <p class="font-semibold text-base text-white">
              {{ $t('navigation.spot') }}
            </p>
            <p class="text-sm text-gray-500 group-hover:text-gray-100 mt-1">
              {{ $t('navigation.spotDescription') }}
            </p>
          </NuxtLink>

          <NuxtLink
            :to="defaultPerpetualMarketRoute"
            class="p-4 block group hover:bg-gray-700 relative z-50 bg-gray-850"
            data-cy="header-trade-link"
            @click="handlePerpetualTradeClickedTrack"
          >
            <p class="font-semibold text-base text-white">
              {{ $t('navigation.perpetual') }}
            </p>
            <p class="text-sm text-gray-500 group-hover:text-gray-100 mt-1">
              {{ $t('navigation.perpetualDescription') }}
            </p>
          </NuxtLink>

          <BaseNuxtLink
            :to="{
              name: 'trading-bots-grid-spot-market',
              params: { market: 'inj-usdt' }
            }"
            class="p-4 block rounded-b group hover:bg-gray-700 relative z-50 bg-gray-850"
            data-cy="grid-spot-trading-link"
          >
            <div class="flex items-center gap-2.5">
              <p class="font-semibold text-base text-white">
                {{ $t('navigation.tradingBots') }}
              </p>

              <div
                class="bg-blue-500 text-gray-100 rounded-[4px] px-1.5 py-0.5 uppercase text-[8px]"
              >
                {{ $t('navigation.new') }}
              </div>
            </div>

            <p class="text-sm text-gray-500 group-hover:text-gray-100 mt-1">
              {{ $t('navigation.tradingBotsDescription') }}
            </p>
          </BaseNuxtLink>
        </template>
      </LayoutNavHoverMenu>

      <LayoutNavMobile />

      <LayoutNavItem
        v-if="!IS_MAINNET || IS_STAGING"
        :to="{
          name: 'trading-bots-liquidity-bots-spot'
        }"
        class="block relative"
        data-cy="header-markets-link"
      >
        <span>{{ $t('navigation.liquidity') }}</span>
        <div
          class="bg-blue-500 rounded-full w-2 h-2 absolute right-3.5 top-2.5 hidden lg:block"
        />
      </LayoutNavItem>

      <LayoutNavHoverMenu>
        <template #default>
          <div class="relative">
            <LayoutNavItemDummy id="rewards-dropdown" class="hidden lg:block">
              {{ $t('navigation.rewards') }}
            </LayoutNavItemDummy>

            <div
              class="bg-blue-500 rounded-full w-2 h-2 absolute right-3.5 top-2.5 hidden lg:block"
            />
          </div>
        </template>

        <template #content>
          <NuxtLink
            :to="{ name: 'trade-and-earn' }"
            class="p-4 block rounded-t group relative z-50 bg-gray-850 hover:bg-gray-700"
          >
            <p class="font-semibold text-base text-white">
              {{ $t('navigation.tradeAndEarn') }}
            </p>
            <p class="text-sm text-gray-500 group-hover:text-gray-100 mt-1">
              {{ $t('navigation.tradeAndEarnDescription') }}
            </p>
          </NuxtLink>

          <NuxtLink
            v-if="!IS_MAINNET || IS_STAGING"
            :to="{ name: 'lp-rewards' }"
            class="p-4 block rounded-t group relative z-50 bg-gray-850 hover:bg-gray-700"
          >
            <div class="flex items-center gap-2.5">
              <p class="font-semibold text-base text-white">
                {{ $t('navigation.lpRewards') }}
              </p>

              <div
                class="bg-blue-500 text-gray-100 rounded-[4px] px-1.5 py-0.5 uppercase text-[8px]"
              >
                {{ $t('navigation.new') }}
              </div>
            </div>

            <p class="text-sm text-gray-500 group-hover:text-gray-100 mt-1">
              {{ $t('navigation.lpRewardsSub') }}
            </p>
          </NuxtLink>

          <a
            href="https://trading.injective.network/program/liquidity"
            target="_blank"
            class="p-4 block group bg-gray-850 hover:bg-gray-700"
          >
            <p class="font-semibold text-base text-white flex items-center">
              <span>{{ $t('navigation.openLiquidityProgram') }}</span>
              <BaseIcon name="external-link" arrow class="w-auto h-3 ml-2" />
            </p>
            <p class="text-sm text-gray-500 group-hover:text-gray-100 mt-1">
              {{ $t('navigation.openLiquidityProgramDescription') }}
            </p>
          </a>
        </template>
      </LayoutNavHoverMenu>

      <LayoutNavItem
        v-if="$route.query.showAuctions === 'true'"
        to="/auctions?showAuctions=true"
        class="block"
      >
        Auctions
      </LayoutNavItem>

      <!-- <LayoutNavItem
        class="block"
        data-cy="nav-leaderboard-link"
        :to="{ name: 'leaderboard' }"
      >
        {{ $t('navigation.leaderboard') }}
      </LayoutNavItem> -->

      <LayoutNavItem
        v-if="walletStore.isUserWalletConnected"
        class="block lg:hidden"
        data-cy="header-account-link"
        :to="{ name: 'account', query: { view: 'balances' } }"
      >
        {{ $t('navigation.account') }}
      </LayoutNavItem>

      <LayoutNavItem
        v-if="walletStore.isUserWalletConnected"
        class="block lg:hidden"
        data-cy="nav-activity-link"
        :to="{ name: 'activity' }"
      >
        {{ $t('navigation.activity') }}
      </LayoutNavItem>
    </nav>
  </div>
</template>
