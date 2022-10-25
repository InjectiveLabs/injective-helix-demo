<template>
  <div class="flex flex-col gap-4">
    <span v-if="!hideTitle" class="text-xs font-semibold uppercase">
      {{ $t('insufficientGas.insufficientGas') }}
    </span>

    <i18n
      path="insufficientGas.insufficientGasNoteDescription"
      tag="p"
      class="text-xs"
    >
      <template #faucetLink>
        <a
          target="_blank"
          class="text-primary-500 dark:text-primary-800"
          :href="faucetUrl"
          @click="handleClose"
        >
          {{ $t('insufficientGas.communityDrivenFaucet') }}
        </a>
      </template>

      <template #hubLink>
        <a
          target="_blank"
          class="text-primary-500 dark:text-primary-800"
          :href="hubUrl"
          @click="handleClose"
        >
          {{ $t('insufficientGas.injectiveHub') }}
        </a>
      </template>
    </i18n>

    <a :href="hubUrl">
      <VButton
        type="button"
        md
        primary
        class="flex justify-center items-center whitespace-nowrap rounded w-full"
        @click="handleClose"
      >
        <span class="mr-2">{{ $t('insufficientGas.getFreeInj') }}</span>
        <IconExternalLink class="w-3 h-3" />
      </VButton>
    </a>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { getHubUrl } from '~/app/utils/helpers'

export default Vue.extend({
  props: {
    hideTitle: {
      type: Boolean,
      default: false
    }
  },

  computed: {
    faucetUrl(): string {
      return 'https://inj.supply/'
    },

    hubUrl(): string {
      return `${getHubUrl()}/bridge`
    }
  },

  methods: {
    handleClose() {
      this.$emit('close')
    }
  }
})
</script>
