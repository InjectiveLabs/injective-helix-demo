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
        <div class="text-sm font-semibold">
          {{ $t('navigation.trade') }}
        </div>
      </template>

      <template #content>
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

        <LayoutNavItem :to="{ name: 'convert' }">
          <span class="font-normal tracking-wide">{{
            $t('navigation.convert')
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
            href="https://dmm.injective.network"
            target="_blank"
          >
            <span class="font-normal tracking-wide">
              {{ $t('navigation.dmmProgram') }}
            </span>
          </a>
        </div>
      </template>
    </AppAccordion>
  </div>
</template>
