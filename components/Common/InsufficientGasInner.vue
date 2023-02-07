<script lang="ts" setup>
import { getHubUrl } from '@/app/utils/helpers'

defineProps({
  hideTitle: Boolean
})

const emit = defineEmits<{
  (e: 'close'): void
}>()

const faucetUrl = 'https://inj.supply/'
const hubUrl = `${getHubUrl()}/bridge`

function handleClose() {
  emit('close')
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <span v-if="!hideTitle" class="text-xs font-semibold uppercase">
      {{ $t('insufficientGas.insufficientGas') }}
    </span>

    <i18n-t
      keypath="insufficientGas.insufficientGasNoteDescription"
      tag="p"
      class="text-xs"
    >
      <template #faucetLink>
        <a
          target="_blank"
          class="text-blue-500"
          :href="faucetUrl"
          @click="handleClose"
        >
          {{ $t('insufficientGas.communityDrivenFaucet') }}
        </a>
      </template>

      <template #hubLink>
        <a
          target="_blank"
          class="text-blue-500"
          :href="hubUrl"
          @click="handleClose"
        >
          {{ $t('insufficientGas.injectiveHub') }}
        </a>
      </template>
    </i18n-t>

    <a :href="hubUrl">
      <AppButton
        type="button"
        class="whitespace-nowrap w-full bg-blue-500 text-black"
        @click="handleClose"
      >
        <div class="flex items-center justify-center">
          <span class="mr-2">{{ $t('insufficientGas.getFreeInj') }}</span>
          <BaseIcon name="external-link" class="w-3 h-3" />
        </div>
      </AppButton>
    </a>
  </div>
</template>
