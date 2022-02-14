<template>
  <div class="h-full w-full flex flex-wrap">
    <div class="w-full">
      <div class="container py-4">
        <div class="w-full mx-auto 3xl:w-11/12 4xl:w-10/12">
          <v-funding-wrapper />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import VFundingWrapper from '~/components/partials/funding/funding-wrapper.vue'
export default Vue.extend({
  components: {
    VFundingWrapper
  }
})
</script>
