<template>
  <div>
    {{ fundingPayment }}
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { FundingPayment } from '@injectivelabs/derivatives-consumer'

export default Vue.extend({
  props: {
    fundingPayment: {
      type: Object as PropType<FundingPayment>,
      required: true
    }
  }
})
</script>
