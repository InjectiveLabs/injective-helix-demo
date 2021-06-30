<template>
  <!-- eslint-disable vue/no-v-html -->
  <main
    class="
      flex flex-wrap flex-col
      justify-center
      items-center
      h-full
      w-full
      px-4
    "
  >
    <div class="container">
      <h1 class="text-white font-bold mt-4 text-3xl text-center">
        {{ $t('maintenance_header') }}
      </h1>
      <h2
        class="text-gray-300 text-xl mx-auto w-full lg:w-2/3 text-center mt-1"
        v-html="$t('maintenance_subheader')"
      ></h2>
      <h3
        class="text-gray-500 text-md text-center"
        v-html="$t('maintenance_body')"
      ></h3>
    </div>
  </main>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  layout: 'blank'
})
</script>
