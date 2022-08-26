<template>
  <div class="mt-4" data-cy="ibc-transfer-modal-note-text-content">
    <div class="flex justify-start items-center">
      <IconInfoTooltip :color="'text-warning'" lg />
      <p class="text-xs text-warning ml-2">
        {{ $t('bridge.ibcTransfersNote') }}
      </p>
    </div>
    <div class="text-center mt-6">
      <VButton
        type="button"
        lg
        primary
        class="w-full rounded flex items-center justify-center"
        data-cy="ibc-transfer-modal-hub-button"
        @click.stop="() => {}"
      >
        <a :href="hubUrl" target="_blank" class="flex items-center">
          <span class="mr-2">Injective Hub</span>
          <IconExternalLink class="w-3 h-3" />
        </a>
      </VButton>
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
