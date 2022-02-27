<template>
  <div class="mt-6">
    <p
      class="text-xs w-full p-2 mr-6 bg-primary-500 bg-opacity-10 text-primary-500 rounded"
    >
      {{ $t('bridge.ibcTransfersNote') }}
    </p>
    <div class="text-center mt-6">
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
