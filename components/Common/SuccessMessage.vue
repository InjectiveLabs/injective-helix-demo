<script lang="ts" setup>
import { getExplorerUrl } from '@shared/utils/network'

const slots = useSlots()

const props = defineProps({
  isHideConfetti: Boolean,

  title: {
    type: String,
    required: true
  },

  txHash: {
    type: String,
    default: ''
  }
})

const explorerUrl = computed(() => {
  if (!props.txHash) {
    return undefined
  }

  return `${getExplorerUrl()}/transaction/${props.txHash}`
})
</script>

<template>
  <div>
    <div class="text-center relative">
      <SharedRainConfetti
        v-if="!isHideConfetti"
        class="absolute inset-0 h-48 -mt-9 w-full"
      />

      <div class="text-white">
        <AppLottie
          v-bind="{ name: 'circle-check-border' }"
          class="mx-auto mt-2 h-12 w-12"
        />

        <h2 class="mt-2 mb-8 text-2xl font-semibold leading-7">
          {{ title }}
        </h2>

        <p v-if="slots.default" class="text-coolGray-600">
          <slot />
        </p>

        <div v-if="explorerUrl" class="mt-2 text-center">
          <NuxtLink
            :to="explorerUrl"
            class="text-green-600 text-base leading-5 hover:text-green-800"
            target="_blank"
          >
            <span>{{ $t('vault.common.viewTransaction') }}</span>
          </NuxtLink>
        </div>

        <slot name="action" />
      </div>
    </div>
  </div>
</template>
