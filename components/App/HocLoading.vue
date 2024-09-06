<script lang="ts" setup>
import { Status, StatusType } from '@injectivelabs/utils'

const props = withDefaults(
  defineProps<{
    status?: Status
    isHelix?: boolean
    noPadding?: boolean
    isLoading?: boolean
    isEmitting?: boolean
    loaderClass?: string
    wrapperClass?: string
  }>(),
  {
    status: () => new Status(StatusType.Idle),
    isHelix: false,
    noPadding: false,
    isLoading: false,
    isEmitting: false,
    loaderClass: 'relative',
    wrapperClass: ''
  }
)

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
  <Suspense>
    <div
      v-if="isLoading"
      :class="[
        wrapperClass || 'h-full',
        {
          'py-4': !noPadding,
          'flex items-center justify-center': props.isHelix
        }
      ]"
    >
      <div
        v-if="isHelix"
        class="w-72 h-72 bg-blue-500/20 absolute left-1/2 blur-[10rem] rounded-full -translate-x-1/2 top-1/2 -translate-y-1/2 z-30"
      />
      <AssetHelixLogoLoading />
    </div>

    <slot v-else />

    <!-- <template #fallback>
      <div class="h-full">
        <AppLoading :class="loaderClass" />
      </div>
    </template> -->
    <!-- </Suspense> -->
  </Suspense>
</template>
