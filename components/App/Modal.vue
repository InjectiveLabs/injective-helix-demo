<script lang="ts" setup>
const slots = useSlots()
const { width } = useWindowSize()

const props = defineProps({
  lg: Boolean,
  md: Boolean,
  sm: Boolean,
  dense: Boolean,
  isAlwaysOpen: Boolean,
  hideCloseButton: Boolean
})

const emit = defineEmits<{
  (e: 'modal:closed'): void
}>()

const classes = computed(() => {
  const result = []

  if (props.sm) {
    result.push('sm:min-w-md sm:max-w-md')
  } else if (props.md) {
    result.push('md:min-w-lg md:max-w-lg', 'md:min-w-2xl lg:max-w-2xl')
  } else if (props.lg) {
    result.push('max-w-lg', 'lg:max-w-3xl')
  } else {
    result.push('max-w-lg', 'lg:max-w-4xl')
  }

  return result.join(' ')
})

function handleClose() {
  if (!props.isAlwaysOpen) {
    emit('modal:closed')
  }
}

watchDebounced(
  width,
  (newWidth, oldWidth) => {
    if (oldWidth && newWidth >= 640) {
      handleClose()
    }
  },
  { debounce: 200, immediate: true }
)
</script>

<template>
  <BaseModalWrapper
    class="relative mx-auto sm:rounded-lg bg-gray-850 max-sm:h-full max-sm:max-w-full max-sm:w-full"
    :class="classes"
    wrapper-class="backdrop-filter backdrop-blur bg-gray-900 bg-opacity-90 max-sm:z-40"
    v-bind="$attrs"
    @close="handleClose"
  >
    <template #default="{ close, showLoading }">
      <div
        :class="{
          'min-h-[320px] flex flex-col': showLoading
        }"
      >
        <div
          class="flex items-center justify-between"
          :class="{ 'mb-6 px-6 pt-6': !dense }"
        >
          <div class="text-sm uppercase text-gray-100 font-semibold flex-grow">
            <slot name="title" />
          </div>

          <div v-if="!hideCloseButton">
            <BaseIcon
              name="close"
              class="ml-auto h-5 w-5 min-w-5 text-gray-200 hover:text-blue-500"
              @click="close"
            />
          </div>
        </div>

        <div
          v-if="showLoading"
          class="grow flex items-center justify-center -mt-6"
        >
          <AppSpinner lg />
        </div>
        <div v-else>
          <div
            :class="{
              'px-6': !dense
            }"
          >
            <slot />
          </div>

          <div v-if="slots.footer" class="px-6">
            <slot name="footer" />
          </div>

          <div :class="{ 'pb-6': !dense }" />
        </div>
      </div>
    </template>
  </BaseModalWrapper>
</template>
