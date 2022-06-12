<template>
  <div id="pro" class="w-full h-full min-h-screen bg-gray-1050 relative">
    <transition name="page" appear>
      <HocLoading :status="status">
        <div>
          <SidebarMobile
            :is-sidebar-open="isOpenSidebar"
            @sidebar-closed="onCloseSideBar"
          />
          <client-only>
            <div class="relative bg-gray-1050">
              <TopBar @sidebar-opened="isOpenSidebar = true" />
              <main
                class="w-full h-full min-h-screen-excluding-header flex flex-col"
              >
                <portal-target name="backLink" />
                <div class="relative flex-grow">
                  <nuxt />
                </div>
                <VFooter v-if="showFooter" />
              </main>
              <ModalAuctionCountdown v-if="SHOW_AUCTION_COUNTDOWN" />
              <ModalInsufficientInjForGas />
            </div>
          </client-only>
        </div>
      </HocLoading>
    </transition>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { Status, StatusType } from '@injectivelabs/utils'
import Footer from '~/components/layout/footer/index.vue'
import TopBar from '~/components/layout/topbar.vue'
import SidebarMobile from '~/components/layout/sidebar-mobile.vue'
import ModalAuctionCountdown from '~/components/partials/modals/auction-countdown.vue'
import ModalInsufficientInjForGas from '~/components/partials/modals/insufficient-inj-for-gas.vue'
import { SHOW_AUCTION_COUNTDOWN } from '~/app/utils/constants'

export default Vue.extend({
  components: {
    ModalAuctionCountdown,
    ModalInsufficientInjForGas,
    TopBar,
    VFooter: Footer,
    SidebarMobile
  },

  data() {
    return {
      SHOW_AUCTION_COUNTDOWN,
      isOpenSidebar: false,
      status: new Status(StatusType.Loading)
    }
  },

  computed: {
    showFooter(): boolean {
      const { $route } = this

      return ['index', 'portfolio', 'markets'].includes($route.name as string)
    }
  },

  mounted() {
    Promise.all([this.$accessor.wallet.init()])
      .then(() => {
        //
      })
      .catch(this.$onRejected)
      .finally(() => {
        this.status.setIdle()
      })

    Promise.all([
      this.$accessor.app.init(),
      this.$accessor.bank.init(),
      this.$accessor.account.init()
    ])
      .then(() => {
        //
      })
      .catch(this.$onRejected)

    // Actions that should't block the app from loading
    Promise.all([
      this.$accessor.app.fetchGasPrice(),
      this.$accessor.referral.init(),
      this.$accessor.exchange.initFeeDiscounts()
    ]).then(() => {
      //
    })

    this.onLoadMarketsInit()

    if (SHOW_AUCTION_COUNTDOWN) {
      this.$accessor.auction.fetchAuctionModuleState()
    }

    this.$root.$on('wallet-connected', this.handleWalletConnected)
    this.$root.$on('nav-link-clicked', this.onCloseSideBar)
  },

  beforeDestroy() {
    this.$root.$off('wallet-connected', this.handleWalletConnected)
    this.$root.$off('nav-link-clicked', this.onCloseSideBar)
  },

  methods: {
    onLoadMarketsInit() {
      this.$accessor.app.setMarketsLoadingState(StatusType.Loading)

      Promise.all([
        this.$accessor.spot.init(),
        this.$accessor.derivatives.init()
      ])
        .then(() => {
          //
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
