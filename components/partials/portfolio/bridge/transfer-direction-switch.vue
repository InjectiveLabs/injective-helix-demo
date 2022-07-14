<template>
  <div class="flex justify-between items-center">
    <NetworkCardBase
      class="w-1/2"
      hide-icon
      data-cy="transfer-modal-from-text-content"
      :network-meta="originNetworkMeta"
    />

    <div
      class="bg-primary-500 min-w-6 h-6 mx-6 flex items-center justify-center rounded-full cursor-pointer"
      data-cy="transfer-modal-direction-toggle-button"
    >
      <IconArrowSwap
        class="text-gray-1000 w-6 h-6 rotate-180 select-none"
        @click.native="handleDirectionSwitch"
      />
    </div>

    <NetworkCardBase
      class="w-1/2"
      hide-icon
      data-cy="transfer-modal-to-text-content"
      :network-meta="destinationNetworkMeta"
    />
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { NetworkMeta } from '@injectivelabs/sdk-ui-ts'
import { TransferDirection, TransferSide } from '~/types'
import NetworkCardBase from '~/components/partials/portfolio/bridge/network-card/index.vue'
import { transferSideMeta } from '~/app/data/bridge'

export default Vue.extend({
  components: {
    NetworkCardBase
  },

  props: {
    transferDirection: {
      required: true,
      type: String as PropType<TransferDirection>
    }
  },

  computed: {
    originNetworkMeta(): NetworkMeta {
      const { transferDirection } = this

      return transferDirection === TransferDirection.bankToTradingAccount
        ? transferSideMeta[TransferSide.Bank]
        : transferSideMeta[TransferSide.TradingAccount]
    },

    destinationNetworkMeta(): NetworkMeta {
      const { transferDirection } = this

      return transferDirection === TransferDirection.bankToTradingAccount
        ? transferSideMeta[TransferSide.TradingAccount]
        : transferSideMeta[TransferSide.Bank]
    }
  },

  methods: {
    handleDirectionSwitch() {
      this.$emit('transfer-direction:switch')
    }
  }
})
</script>
