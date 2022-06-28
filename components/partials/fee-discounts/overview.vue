<template>
  <HocLoading :status="status">
    <div v-if="isUserWalletConnected">
      <HorizontalScrollView>
        <div class="flex-0-full md:col-span-6">
          <TierInfo />
        </div>
        <div class="flex-0-full md:col-span-3">
          <StakedAmount />
        </div>
        <div class="flex-0-full md:col-span-3">
          <TradingVolume />
        </div>
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
import { UI_DEFAULT_MIN_DISPLAY_DECIMALS } from '~/app/utils/constants'

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
      status: new Status(StatusType.Loading),
      slideIndex: 0,
      UI_DEFAULT_MIN_DISPLAY_DECIMALS
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
