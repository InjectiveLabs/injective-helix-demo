<template>
  <div class="mt-6 flex items-center justify-between">
    <p class="text-sm text-gray-300 w-full mr-6">
      {{ $t('bridge.ibcTransfersNote') }}
    </p>
    <v-button
      type="button"
      md
      primary
      class="whitespace-nowrap"
      @click.stop="() => {}"
    >
      <a :href="hubUrl" target="_blank" class="flex items-center">
        <span class="mr-2">Injective Hub</span>
        <v-icon-external-link class="w-3 h-3" />
      </a>
    </v-button>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  computed: {
    hubUrl(): string {
      return 'https://hub.injective.network/bridge'
    }
  }
})
</script>
