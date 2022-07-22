<template>
  <div class="flex flex-col h-0 flex-1">
    <div class="flex-1 flex flex-col overflow-y-auto">
      <Nav />
    </div>
    <div class="flex flex-col mt-auto">
      <!-- -->
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import Nav from '~/components/layout/nav/index.vue'

export default Vue.extend({
  components: {
    Nav
  }
})
</script>
