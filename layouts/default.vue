<template>
  <div id="pro" class="w-full h-full min-h-screen bg-gray-900 relative">
    <transition name="page" appear>
      <HOCLoading :status="status">
        <div>
          <v-sidebar-mobile
            :is-sidebar-open="isOpenSidebar"
            @sidebar-closed="onCloseSideBar"
          />
          <client-only>
            <div class="bg-gray-900 relative">
              <v-topbar @sidebar-opened="isOpenSidebar = true" />
              <main class="w-full h-full">
                <portal-target name="backLink" />
                <div class="py-8 relative">
                  <nuxt />
                </div>
              </main>
              <v-footer />
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
import SidebarMobile from '~/components/layout/sidebar-mobile.vue'
import HOCLoading from '~/components/hoc/loading.vue'

export default Vue.extend({
  components: {
    HOCLoading,
    'v-topbar': Topbar,
    'v-footer': Footer,
    'v-sidebar-mobile': SidebarMobile
  },

  data() {
    return {
      isOpenSidebar: false,
      status: new Status(StatusType.Loading),
      interval: 0 as any
    }
  },

  mounted() {
    Promise.all([
      this.$accessor.app.init(),
      this.$accessor.spot.init(),
      this.$accessor.derivatives.init(),
      this.$accessor.bank.init(),
      this.$accessor.account.init(),
      this.$accessor.wallet.init()
    ])
      .then(() => {
        this.interval = setInterval(async () => {
          await this.$accessor.app.poll()
        }, 2000)
      })
      .catch(this.$onRejected)
      .finally(() => {
        this.status.setIdle()
      })
  },

  destroyed() {
    clearInterval(this.interval)
  },

  methods: {
    onCloseSideBar() {
      if (this.isOpenSidebar) {
        this.isOpenSidebar = false
      }
    }
  }
})
</script>
