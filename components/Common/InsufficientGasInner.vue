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
        <NuxtLink
          target="_blank"
          class="text-blue-500"
          :to="faucetUrl"
          @click="handleClose"
        >
          {{ $t('insufficientGas.communityDrivenFaucet') }}
        </NuxtLink>
      </template>

      <template #hubLink>
        <NuxtLink
          target="_blank"
          class="text-blue-500"
          :to="hubUrl"
          @click="handleClose"
        >
          {{ $t('insufficientGas.injectiveHub') }}
        </NuxtLink>
      </template>
    </i18n-t>

    <NuxtLink :to="faucetUrl">
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
    </NuxtLink>
  </div>
</template>
