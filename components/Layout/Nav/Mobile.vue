<script lang="ts" setup>
import {
  getDefaultPerpetualMarketRouteParams,
  getDefaultSpotMarketRouteParams
} from '@/app/utils/market'

const tradeMenuOpen = ref(false)
const rewardsMenuOpen = ref(false)

const defaultPerpetualMarketRoute = getDefaultPerpetualMarketRouteParams()
const defaultSpotMarketRoute = getDefaultSpotMarketRouteParams()

function handleToggleTradeMenu() {
  tradeMenuOpen.value = !tradeMenuOpen.value
}

function handleToggleRewardsMenu() {
  rewardsMenuOpen.value = !rewardsMenuOpen.value
}
</script>

<template>
  <div class="block lg:hidden">
    <AppAccordion
      :is-open="tradeMenuOpen"
      sm
      @panel:toggle="handleToggleTradeMenu"
    >
      <template #title>
        <div class="flex gap-0.5">
          <div class="text-sm font-semibold">
            {{ $t('navigation.trade') }}
          </div>
          <div class="bg-blue-500 rounded-full w-2 h-2 block lg:hidden" />
        </div>
      </template>

      <template #content>
        <LayoutNavItem :to="{ name: 'swap' }">
          <div class="flex items-center gap-2 font-normal tracking-wide">
            <p>
              {{ $t('navigation.swap') }}
            </p>

            <div
              class="h-4 flex items-center rounded-[4px] px-1 py-1 bg-blue-500"
            >
              <span class="text-gray-100 uppercase text-[8px]">
                {{ $t('navigation.new') }}
              </span>
            </div>
          </div>
        </LayoutNavItem>

        <LayoutNavItem :to="defaultSpotMarketRoute">
          <span class="font-normal tracking-wide">{{
            $t('navigation.spot')
          }}</span>
        </LayoutNavItem>

        <LayoutNavItem :to="defaultPerpetualMarketRoute">
          <span class="font-normal tracking-wide">{{
            $t('navigation.perpetual')
          }}</span>
        </LayoutNavItem>

        <!-- <LayoutNavItem :to="{ name: 'convert' }">
          <span class="font-normal tracking-wide">{{
            $t('navigation.convert')
          }}</span>
        </LayoutNavItem> -->

        <LayoutNavItem
          :to="{
            name: 'trading-bots-grid-spot-market',
            params: { market: 'inj-usdt' }
          }"
        >
          <span class="font-normal tracking-wide">{{
            $t('navigation.tradingBots')
          }}</span>
        </LayoutNavItem>
      </template>
    </AppAccordion>

    <AppAccordion
      :is-open="rewardsMenuOpen"
      sm
      @panel:toggle="handleToggleRewardsMenu"
    >
      <template #title>
        <div class="text-sm font-semibold">
          {{ $t('navigation.rewards') }}
        </div>
      </template>

      <template #content>
        <div>
          <LayoutNavItem :to="{ name: 'trade-and-earn' }">
            <span class="font-normal tracking-wide">
              {{ $t('navigation.tradeAndEarn') }}
            </span>
          </LayoutNavItem>

          <a
            class="text-gray-200 hover:bg-gray-800 hover:text-white text-sm font-semibold rounded-lg cursor-pointer mx-px h-10 flex items-center px-6 py-2"
            href="https://trading.injective.network/program/liquidity"
            target="_blank"
          >
            <span class="font-normal tracking-wide">
              {{ $t('navigation.openLiquidityProgram') }}
            </span>
          </a>
        </div>
      </template>
    </AppAccordion>
  </div>
</template>
