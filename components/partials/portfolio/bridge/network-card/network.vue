<template>
  <NetworkCardBase v-bind="{ networkMeta }" />
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { NetworkMeta, BridgingNetwork } from '@injectivelabs/sdk-ui-ts'
import { networksMeta } from '~/app/data/bridge'

export default Vue.extend({
  props: {
    network: {
      type: String as PropType<BridgingNetwork>,
      required: true
    }
  },

  data() {
    return {
      BridgingNetwork,
      networksMeta
    }
  },

  computed: {
    networkMeta(): NetworkMeta {
      const { network } = this

      return networksMeta.find(({ value }) => network === value) as NetworkMeta
    }
  }
})
</script>
