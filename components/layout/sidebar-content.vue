<template>
  <div class="flex flex-col h-0 flex-1">
    <div class="flex items-center py-6 px-6 -mt-6 md:mt-0">
      <v-logo class="h-8 w-auto mr-4" alt="InjectivePro" />
      <div class="text-white">
        <v-logo-text class="w-24" />
        <p class="text-xs justify-center uppercase flex mx-px">
          <span>p</span>
          <span class="mx-1">r</span>
          <span>o</span>
        </p>
      </div>
    </div>
    <div class="flex-1 flex flex-col overflow-y-auto">
      <v-nav />
    </div>
    <div class="flex flex-col mt-auto">
      <!-- -->
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import Logo from '~/components/elements/logo.vue'
import Nav from '~/components/layout/nav/index.vue'
import LogoText from '~/components/elements/logo-text.vue'

export default Vue.extend({
  components: {
    'v-logo': Logo,
    'v-logo-text': LogoText,
    'v-nav': Nav
  }
})
</script>
