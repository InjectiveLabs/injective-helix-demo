<template>
  <div class="h-full w-full flex flex-wrap">
    <div class="w-full">
      <div class="container py-4">
        <div class="w-full mx-auto 3xl:w-11/12 4xl:w-10/12">
          <v-welcome-banner />
          <v-new-user-banner class="mt-6" />

          <div class="w-full">
            <v-panel :title="$t('balances')" class="mt-6">
              <v-balances />
            </v-panel>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import VBalances from '~/components/partials/funding/balances/index.vue'
import VWelcomeBanner from '~/components/partials/banners/welcome.vue'
import VNewUserBanner from '~/components/partials/banners/new-user.vue'

export default Vue.extend({
  components: {
    VBalances,
    VNewUserBanner,
    VWelcomeBanner
  },

  beforeDestroy() {
    this.$accessor.wallet.resetPage()
  }
})
</script>
