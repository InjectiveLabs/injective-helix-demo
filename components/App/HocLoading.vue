<script lang="ts" setup>
import { Status, StatusType } from '@injectivelabs/utils'

const props = defineProps({
  isEmitting: Boolean,
  noPadding: Boolean,
  isLoading: Boolean,

  status: {
    type: Object as PropType<Status>,
    default: new Status(StatusType.Idle)
  },

  loaderClass: {
    type: String,
    default: 'relative'
  }
})

const emit = defineEmits<{
  loading: []
  loaded: []
}>()

const isLoading = computed(() => props.isLoading || props.status.isLoading())

watch(isLoading, (isLoading, oldIsLoading) => {
  if (oldIsLoading && !isLoading && props.isEmitting) {
    emit('loaded')
  }

  if (isLoading && !oldIsLoading && props.isEmitting) {
    emit('loading')
  }
})
</script>

<template>
  <div>
    <Suspense>
      <div
        v-if="isLoading"
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
