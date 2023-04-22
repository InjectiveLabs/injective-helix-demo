<script lang="ts" setup>
import { MarketType } from '@injectivelabs/sdk-ui-ts'
import { DefaultMarket, TradeClickOrigin } from '@/types'
import { amplitudeTradeTracker } from '@/app/providers/amplitude'
import {
  getDefaultPerpetualMarketRouteParams,
  getDefaultSpotMarketRouteParams
} from '@/app/utils/market'

const walletStore = useWalletStore()

const defaultPerpetualMarketRoute = getDefaultPerpetualMarketRouteParams()
const defaultSpotMarketRoute = getDefaultSpotMarketRouteParams()

const tradeDropdownShown = ref(false)
const rewardsDropdownShown = ref(false)

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

function handleTradeDropdownShownChange(value: boolean) {
  tradeDropdownShown.value = value

  if (value) {
    rewardsDropdownShown.value = false
  }
}

function handleRewardsDropdownShownChange(value: boolean) {
  rewardsDropdownShown.value = value

  if (value) {
    tradeDropdownShown.value = false
  }
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

      <LayoutNavHoverMenu
        :shown="tradeDropdownShown"
        @dropdown:toggle="handleTradeDropdownShownChange"
      >
        <template #default>
          <LayoutNavItemDummy id="trade-dropdown" class="hidden lg:block">
            {{ $t('navigation.trade') }}
          </LayoutNavItemDummy>
        </template>

        <template #content>
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

          <NuxtLink
            :to="{ name: 'convert' }"
            class="p-4 block rounded-b group hover:bg-gray-700 relative z-50 bg-gray-850"
            data-cy="header-convert-link"
          >
            <p class="font-semibold text-base text-white">
              {{ $t('navigation.convert') }}
            </p>
            <p class="text-sm text-gray-500 group-hover:text-gray-100 mt-1">
              {{ $t('navigation.convertDescription') }}
            </p>
          </NuxtLink>
        </template>
      </LayoutNavHoverMenu>

      <LayoutNavMobile />

      <LayoutNavHoverMenu
        :shown="rewardsDropdownShown"
        @dropdown:toggle="handleRewardsDropdownShownChange"
      >
        <template #default>
          <LayoutNavItemDummy id="rewards-dropdown" class="hidden lg:block">
            {{ $t('navigation.rewards') }}
          </LayoutNavItemDummy>
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

          <a
            href="https://dmm.injective.network"
            target="_blank"
            class="p-4 block group bg-gray-850 hover:bg-gray-700"
          >
            <p class="font-semibold text-base text-white flex items-center">
              <span>{{ $t('navigation.dmmProgram') }}</span>
              <BaseIcon name="external-link" arrow class="w-auto h-3 ml-2" />
            </p>
            <p class="text-sm text-gray-500 group-hover:text-gray-100 mt-1">
              {{ $t('navigation.dmmProgramDescription') }}
            </p>
          </a>
        </template>
      </LayoutNavHoverMenu>

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
