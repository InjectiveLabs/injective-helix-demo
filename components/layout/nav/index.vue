<template>
  <div>
    <nav class="block flex-1 lg:flex">
      <NavItem :to="{ name: 'index' }" class="block lg:hidden">
        {{ $t('navigation.home') }}
      </NavItem>
      <NavItem
        :to="{ name: 'markets' }"
        class="block"
        data-cy="header-markets-link"
      >
        {{ $t('trade.markets') }}
      </NavItem>

      <NavItemDummy
        id="trade-dropdown"
        class="hidden lg:block"
        @mouseenter.native="handleShowTradeDropdown"
        @mouseleave.native="handleHideTradeDropdown"
        @focus.native="handleShowTradeDropdown"
        @blur.native="handleHideTradeDropdown"
      >
        {{ $t('navigation.trade') }}
      </NavItemDummy>

      <MobileNav />

      <NavItemDummy
        id="rewards-dropdown"
        class="hidden lg:block"
        @mouseenter.native="handleShowRewardsDropdown"
        @mouseleave.native="handleHideRewardsDropdown"
        @focus.native="handleShowRewardsDropdown"
        @blur.native="handleHideRewardsDropdown"
      >
        {{ $t('navigation.rewards') }}
      </NavItemDummy>

      <NavItem
        v-if="isUserWalletConnected"
        class="block lg:hidden"
        data-cy="nav-portfolio-link"
        :to="{ name: 'portfolio' }"
      >
        {{ $t('navigation.portfolio') }}
      </NavItem>
      <NavItem
        v-if="isUserWalletConnected"
        class="block lg:hidden"
        data-cy="nav-activity-link"
        :to="{ name: 'activity' }"
      >
        {{ $t('navigation.activity') }}
      </NavItem>
    </nav>

    <PopperBox
      ref="popper-trade-dropdown"
      class="popper rounded-lg flex flex-col flex-wrap text-xs absolute w-80 xs:w-96 bg-gray-950 shadow-dropdown"
      :options="popperOptions"
      binding-element="#trade-dropdown"
    >
      <nuxt-link
        :to="{
          name: 'spot-spot',
          params: { spot: DefaultMarket.Spot }
        }"
        class="p-4 block rounded-t group hover:bg-gray-700 relative z-10 bg-gray-950"
        data-cy="header-trade-link"
        @click.native="handleSpotTradeClickedTrack"
      >
        <p class="font-semibold text-base text-white">
          {{ $t('navigation.spot') }}
        </p>
        <p class="text-sm text-gray-500 group-hover:text-gray-100 mt-1">
          {{ $t('navigation.spotDescription') }}
        </p>
      </nuxt-link>
      <nuxt-link
        :to="{
          name: 'perpetuals-perpetual',
          params: {
            perpetual: DefaultMarket.Perpetual
          }
        }"
        class="p-4 block group hover:bg-gray-700 relative z-10 bg-gray-950"
        data-cy="header-trade-link"
        @click.native="handlePerpetualTradeClickedTrack"
      >
        <p class="font-semibold text-base text-white">
          {{ $t('navigation.perpetual') }}
        </p>
        <p class="text-sm text-gray-500 group-hover:text-gray-100 mt-1">
          {{ $t('navigation.perpetualDescription') }}
        </p>
      </nuxt-link>
      <nuxt-link
        :to="{ name: 'convert-convert', query: { from: 'usdt', to: 'inj' } }"
        class="p-4 block rounded-b group hover:bg-gray-700 relative z-10 bg-gray-950"
        data-cy="header-convert-link"
      >
        <p class="font-semibold text-base text-white">
          {{ $t('navigation.convert') }}
        </p>
        <p class="text-sm text-gray-500 group-hover:text-gray-100 mt-1">
          {{ $t('navigation.convertDescription') }}
        </p>
      </nuxt-link>
    </PopperBox>

    <PopperBox
      ref="popper-rewards-dropdown"
      class="popper rounded-lg flex flex-col flex-wrap text-xs absolute w-80 xs:w-96 bg-gray-950 shadow-dropdown"
      :options="popperOptions"
      binding-element="#rewards-dropdown"
    >
      <nuxt-link
        :to="{ name: 'trade-and-earn' }"
        class="p-4 block rounded-t group hover:bg-gray-700 relative z-10 bg-gray-950"
      >
        <p class="font-semibold text-base text-white">
          {{ $t('navigation.tradeAndEarn') }}
        </p>
        <p class="text-sm text-gray-500 group-hover:text-gray-100 mt-1">
          {{ $t('navigation.tradeAndEarnDescription') }}
        </p>
      </nuxt-link>
      <a
        href="https://dmm.injective.network"
        target="_blank"
        class="p-4 block group hover:bg-gray-700"
      >
        <p class="font-semibold text-base text-white flex items-center">
          <span>{{ $t('navigation.dmmProgram') }}</span>
          <IconExternalLinkArrow class="w-auto h-3 ml-2" />
        </p>
        <p class="text-sm text-gray-500 group-hover:text-gray-100 mt-1">
          {{ $t('navigation.dmmProgramDescription') }}
        </p>
      </a>
      <!-- <a
        href="https://affiliate.helixapp.com"
        target="_blank"
        class="p-4 block rounded-b group hover:bg-gray-700"
      >
        <p class="font-semibold text-base text-white flex items-center">
          <span>{{ $t('navigation.affiliateProgram') }}</span>
          <IconExternalLinkArrow class="w-auto h-3 ml-2" />
        </p>
        <p class="text-sm text-gray-500 group-hover:text-gray-100 mt-1">
          {{ $t('navigation.affiliateProgramDescription') }}
        </p>
      </a> -->
    </PopperBox>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { FeeDiscountAccountInfo } from '@injectivelabs/sdk-ts'
import { MarketType } from '@injectivelabs/sdk-ui-ts'
import { BigNumberInBase } from '@injectivelabs/utils'
import { Identify, identify } from '@amplitude/analytics-browser'
import NavItem from './item.vue'
import NavItemDummy from './item-dummy.vue'
import MobileNav from './mobile.vue'
import PopperBox from '~/components/elements/popper-box.vue'
import { AmplitudeEvents, DefaultMarket, TradeClickOrigin } from '~/types'
import { AMPLITUDE_VIP_TIER_LEVEL } from '~/app/utils/vendor'

import {
  derivativeMarketRouteNames,
  spotMarketRouteNames
} from '~/app/data/market'

export default Vue.extend({
  components: {
    NavItem,
    NavItemDummy,
    PopperBox,
    MobileNav
  },

  data() {
    return { DefaultMarket }
  },

  computed: {
    isUserWalletConnected(): boolean {
      return this.$accessor.wallet.isUserWalletConnected
    },

    feeDiscountAccountInfo(): FeeDiscountAccountInfo | undefined {
      return this.$accessor.exchange.feeDiscountAccountInfo
    },

    tierLevel(): number {
      const { feeDiscountAccountInfo } = this

      if (!feeDiscountAccountInfo) {
        return 0
      }

      return new BigNumberInBase(
        feeDiscountAccountInfo.tierLevel || 0
      ).toNumber()
    },

    isMarketPage(): boolean {
      const { $route } = this

      return [...derivativeMarketRouteNames, ...spotMarketRouteNames].includes(
        $route.name as string
      )
    },

    $rewardsPopper(): any {
      return this.$refs['popper-rewards-dropdown']
    },

    $tradePopper(): any {
      return this.$refs['popper-trade-dropdown']
    },

    popperOptions(): any {
      return {
        placement: 'bottom',
        modifiers: [
          {
            name: 'offset',
            options: {
              offset: [0, 22]
            }
          }
        ]
      }
    }
  },

  methods: {
    handleShowRewardsDropdown() {
      if (this.$rewardsPopper) {
        this.$rewardsPopper.showDropdown()
      }
    },

    handleHideRewardsDropdown() {
      if (this.$rewardsPopper) {
        this.$rewardsPopper.hideDropdown()
      }
    },

    handleShowTradeDropdown() {
      if (this.$tradePopper) {
        this.$tradePopper.showDropdown()
      }
    },

    handleHideTradeDropdown() {
      if (this.$tradePopper) {
        this.$tradePopper.hideDropdown()
      }
    },

    handleSpotTradeClickedTrack() {
      const identifyObj = new Identify()
      identifyObj.set(AMPLITUDE_VIP_TIER_LEVEL, this.tierLevel)
      identify(identifyObj)

      this.$amplitude.track(AmplitudeEvents.TradeClicked, {
        market: DefaultMarket.Spot,
        marketType: MarketType.Spot,
        origin: TradeClickOrigin.TopMenu
      })
    },

    handlePerpetualTradeClickedTrack() {
      const identifyObj = new Identify()
      identifyObj.set(AMPLITUDE_VIP_TIER_LEVEL, this.tierLevel)
      identify(identifyObj)

      this.$amplitude.track(AmplitudeEvents.TradeClicked, {
        market: DefaultMarket.Perpetual,
        marketType: MarketType.Perpetual,
        origin: TradeClickOrigin.TopMenu
      })
    }
  }
})
</script>
