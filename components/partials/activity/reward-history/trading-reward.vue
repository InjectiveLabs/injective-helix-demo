<template>
  <div>
    {{ fundingPayment }}
  </div>
</template>

<script lang="ts">
import { FundingPayment } from '@injectivelabs/sdk-ts'
import Vue, { PropType } from 'vue'

export default Vue.extend({
  props: {
    fundingPayment: {
      type: Object as PropType<FundingPayment>,
      required: true
    }
  }
})
</script>
