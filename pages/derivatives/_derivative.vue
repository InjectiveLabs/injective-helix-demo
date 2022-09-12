<template>
  <span></span>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  components: {
    //
  },

  created() {
    this.$router.push({
      name: 'futures-futures',
      params: {
        futures: this.$route.params.derivative
      }
    })
  }
})
</script>
