<template>
  <HocLoading :status="status">
    <div v-if="isUserWalletConnected">
      <HorizontalScrollView>
        <TierInfo class="flex-0-full md:col-span-6" />
        <StakedAmount class="flex-0-full md:col-span-3" />
        <TradingVolume class="flex-0-full md:col-span-3" />
      </HorizontalScrollView>
    </div>
  </HocLoading>
</template>

<script lang="ts">
import {
  Status,
  StatusType
} from '@injectivelabs/utils'
import Vue from 'vue'
import TierInfo from './tier-info.vue'
import StakedAmount from './staked-amount.vue'
import TradingVolume from './trading-volume.vue'

import HorizontalScrollView from '~/components/elements/horizontal-scroll-view.vue'

export default Vue.extend({
  components: {
    HorizontalScrollView,
    TierInfo,
    StakedAmount,
    TradingVolume
  },

  data() {
    return {
      status: new Status(StatusType.Loading)
    }
  },

  computed: {
    isUserWalletConnected(): boolean {
      return this.$accessor.wallet.isUserWalletConnected
    }
  },

  mounted() {
    Promise.all([this.$accessor.exchange.fetchFeeDiscountAccountInfo()])
      .then(() => {
        //
      })
      .catch(this.$onRejected)
      .finally(() => {
        this.status.setIdle()
      })
  }
})
</script>
