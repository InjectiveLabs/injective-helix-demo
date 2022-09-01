<template>
  <div>
    <AppRedirect />
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import AppRedirect from '~/components/partials/home/app-redirect.vue'

export default Vue.extend({
  components: {
    AppRedirect
  },

  data() {
    return {
      //
    }
  }
})
</script>
