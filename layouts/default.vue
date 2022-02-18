<template>
  <div id="pro" class="w-full h-full min-h-screen bg-gray-1050 relative">
    <transition name="page" appear>
      <HOCLoading :status="status">
        <div>
          <v-sidebar-mobile
            :is-sidebar-open="isOpenSidebar"
            @sidebar-closed="onCloseSideBar"
          />
          <client-only>
            <div class="relative bg-gray-1050">
              <v-topbar @sidebar-opened="isOpenSidebar = true" />
              <main class="w-full h-full min-h-screen">
                <portal-target name="backLink" />
                <div class="relative">
                  <nuxt />
                </div>
              </main>
              <v-footer />
              <v-market-slideout />
              <v-modal-auction-countdown v-if="SHOW_AUCTION_COUNTDOWN" />
            </div>
          </client-only>
        </div>
      </HOCLoading>
    </transition>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { Status, StatusType } from '@injectivelabs/utils'
import Footer from '~/components/layout/footer/index.vue'
import Topbar from '~/components/layout/topbar.vue'
import MarketSlideout from '~/components/partials/common/markets/slideout.vue'
import SidebarMobile from '~/components/layout/sidebar-mobile.vue'
import HOCLoading from '~/components/hoc/loading.vue'
import VModalAuctionCountdown from '~/components/partials/modals/auction-countdown.vue'
import { SHOW_AUCTION_COUNTDOWN } from '~/app/utils/constants'

export default Vue.extend({
  components: {
    HOCLoading,
    VModalAuctionCountdown,
    'v-market-slideout': MarketSlideout,
    'v-topbar': Topbar,
    'v-footer': Footer,
    'v-sidebar-mobile': SidebarMobile
  },

  data() {
    return {
      SHOW_AUCTION_COUNTDOWN,
      isOpenSidebar: false,
      status: new Status(StatusType.Loading),
      interval: 0 as any
    }
  },

  mounted() {
    Promise.all([this.$accessor.wallet.init()])
      .then(() => {
        this.interval = setInterval(async () => {
          await this.$accessor.app.poll()
        }, 2000)
      })
      .catch(this.$onRejected)
      .finally(() => {
        this.status.setIdle()
      })

    Promise.all([
      this.$accessor.app.init(),
      this.$accessor.app.fetchGasPrice(),
      this.$accessor.bank.init(),
      this.$accessor.account.init(),
      this.$accessor.referral.init()
    ])
      .then(() => {
        //
      })
      .catch(this.$onRejected)

    this.onLoadMarketsInit()

    if (SHOW_AUCTION_COUNTDOWN) {
      this.$accessor.auction.fetchAuctionModuleState()
    }
  },

  beforeDestroy() {
    this.$root.$off('wallet-connected', this.handleWalletConnected)
    clearInterval(this.interval)
  },

  methods: {
    onLoadMarketsInit() {
      this.$accessor.app.setMarketsLoadingState(StatusType.Loading)

      Promise.all([
        this.$accessor.spot.init(),
        this.$accessor.derivatives.init()
      ])
        .then(() => {
          this.interval = setInterval(async () => {
            await this.$accessor.app.poll()
          }, 2000)
        })
        .catch(this.$onRejected)
        .finally(() => {
          this.$accessor.app.setMarketsLoadingState(StatusType.Idle)
        })
    },

    onCloseSideBar() {
      if (this.isOpenSidebar) {
        this.isOpenSidebar = false
      }
    },

    handleWalletConnected() {
      this.$accessor.referral.init()
    }
  }
})
</script>
