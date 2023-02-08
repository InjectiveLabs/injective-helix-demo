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
    default: 'relative'
  }
})
</script>

<template>
  <div>
    <Suspense>
      <div
        v-if="status.isLoading() || showLoading"
        class="h-full"
        :class="{
          'py-4': !noPadding
        }"
      >
        <AppLoading :class="loaderClass" />
      </div>
      <slot v-else />
      <template #fallback>
        <div class="h-full">
          <AppLoading :class="loaderClass" />
        </div>
      </template>
    </Suspense>
  </div>
</template>
