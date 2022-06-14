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

      <NavItem
        :to="{
          name: 'derivatives-derivative',
          params: { derivative: 'btc-usdt-perp' }
        }"
        class="block"
        data-cy="header-trade-link"
      >
        {{ $t('navigation.trade') }}
      </NavItem>

      <NavItem
        v-if="isStagingOrTestnetOrDevnet"
        :to="{ name: 'convert-convert', query: { from: 'usdt', to: 'inj' } }"
        class="block"
        data-cy="header-convert-link"
      >
        {{ $t('navigation.convert') }}
      </NavItem>

      <NavItemDummy
        id="rewards-dropdown"
        class="hidden lg:block"
        @mouseenter.native="handleShowDropdown"
        @mouseleave.native="handleHideDropdown"
        @focus.native="handleShowDropdown"
        @blur.native="handleHideDropdown"
      >
        {{ $t('navigation.rewards') }}
      </NavItemDummy>
      <NavItem class="block lg:hidden" :to="{ name: 'trade-and-earn' }">
        {{ $t('navigation.rewards') }}
      </NavItem>
      <a
        href="https://dmm.injective.network/"
        target="_blank"
        class="lg:hidden"
      >
        <NavItemDummy>{{ $t('navigation.dmmProgram') }}</NavItemDummy>
      </a>
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
      ref="popper-rewards-dropdown"
      class="popper rounded-lg flex flex-col flex-wrap text-xs absolute w-80 xs:w-96"
      :class="[isMarketPage ? 'bg-gray-900' : 'bg-gray-800']"
      binding-element="#rewards-dropdown"
    >
      <nuxt-link
        :to="{ name: 'trade-and-earn' }"
        :class="[isMarketPage ? 'bg-gray-900' : 'bg-gray-800']"
        class="p-6 block rounded-t-lg group hover:bg-gray-700 relative z-10"
      >
        <p
          class="font-semibold tracking-widest uppercase text-sm text-gray-200 group-hover:text-gray-100"
        >
          {{ $t('navigation.tradeAndEarn') }}
        </p>
        <p
          class="text-sm leading-6 text-gray-500 group-hover:text-gray-100 mt-3"
        >
          {{ $t('navigation.tradeAndEarnDescription') }}
        </p>
      </nuxt-link>
      <a
        href="https://dmm.injective.network/"
        target="_blank"
        class="p-6 block rounded-b-lg group hover:bg-gray-700"
      >
        <p
          class="font-semibold tracking-widest uppercase text-sm text-gray-200 group-hover:text-gray-100 flex items-center"
        >
          <span>{{ $t('navigation.dmmProgram') }}</span>
          <IconExternalLinkArrow class="w-auto h-2 ml-2" />
        </p>
        <p
          class="text-sm leading-6 text-gray-500 group-hover:text-gray-100 mt-3"
        >
          {{ $t('navigation.dmmProgramDescription') }}
        </p>
      </a>
    </PopperBox>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import NavItem from './item.vue'
import NavItemDummy from './item-dummy.vue'
import PopperBox from '~/components/elements/popper-box.vue'
import { IS_DEVNET, IS_STAGING, IS_TESTNET } from '~/app/utils/constants'

export default Vue.extend({
  components: {
    NavItem,
    NavItemDummy,
    PopperBox
  },

  computed: {
    isUserWalletConnected(): boolean {
      return this.$accessor.wallet.isUserWalletConnected
    },

    isMarketPage(): boolean {
      const { $route } = this
      return ['spot-spot', 'derivatives-derivative'].includes(
        $route.name as string
      )
    },

    $popper(): any {
      return this.$refs['popper-rewards-dropdown']
    },

    isStagingOrTestnetOrDevnet(): boolean {
      return IS_TESTNET || IS_DEVNET || IS_STAGING
    }
  },

  methods: {
    handleShowDropdown() {
      if (this.$popper) {
        this.$popper.showDropdown()
      }
    },

    handleHideDropdown() {
      if (this.$popper) {
        this.$popper.hideDropdown()
      }
    }
  }
})
</script>
