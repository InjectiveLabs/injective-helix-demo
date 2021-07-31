<template>
  <div id="pro" class="w-full h-full min-h-screen bg-dark-900 relative">
    <transition name="page" appear>
      <HOCLoading :status="status">
        <div>
          <client-only>
            <app-header />
            <main class="overflow-y-auto">
              <nuxt />
            </main>
            <app-footer />
            <egg />
            <modal-transfer />
          </client-only>
        </div>
      </HOCLoading>
    </transition>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { Status, StatusType } from '@injectivelabs/utils'
import ModalTransfer from '~/components/transfer/index.vue'
import Header from '~/components/layouts/desktop/header.vue'
import Footer from '~/components/layouts/desktop/footer/index.vue'
import Egg from '~/components/elements/egg.vue'
import HOCLoading from '~/components/elements/with-loading.vue'

export default Vue.extend({
  components: {
    HOCLoading,
    ModalTransfer,
    'app-header': Header,
    'app-footer': Footer,
    Egg
  },

  data() {
    return {
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
  }
})
</script>
