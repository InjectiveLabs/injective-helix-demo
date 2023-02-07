<script lang="ts" setup>
import { PropType } from 'vue'
import { Status, StatusType } from '@injectivelabs/utils'

defineProps({
  noPadding: Boolean,
  showLoading: Boolean,

  status: {
    type: Object as PropType<Status>,
    default: new Status(StatusType.Idle)
  },

  loaderClass: {
    type: String,
    default: 'absolute'
  }
})
</script>

<template>
  <div class="h-full-flex">
    <Suspense>
      <div
        v-if="status.isLoading() || showLoading"
        class="flex grow items-center relative justify-center"
        :class="{
          'py-4': !noPadding
        }"
      >
        <AppLoading :class="loaderClass" />
      </div>
      <slot v-else />
      <template #fallback>
        <div class="flex grow items-center">
          <AppLoading :class="loaderClass" />
        </div>
      </template>
    </Suspense>
  </div>
</template>
