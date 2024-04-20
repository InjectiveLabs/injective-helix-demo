<script lang="ts" setup>
const slots = useSlots()
const { width } = useWindowSize()

const props = defineProps({
  isLg: Boolean,
  isMd: Boolean,
  isSm: Boolean,
  isDense: Boolean,
  isAlwaysOpen: Boolean,
  isHideCloseButton: Boolean,

  modalContentClass: {
    type: String,
    default: ''
  }
})

const emit = defineEmits<{
  'modal:closed': []
}>()

const classes = computed(() => {
  const result = []

  if (props.isSm) {
    result.push('sm:min-w-md sm:max-w-md')
  } else if (props.isMd) {
    result.push('md:min-w-lg md:max-w-lg', 'md:min-w-2xl lg:max-w-2xl')
  } else if (props.isLg) {
    result.push('max-w-lg', 'lg:max-w-3xl')
  } else {
    result.push('max-w-lg', 'lg:max-w-4xl')
  }

  return result.join(' ')
})

function closeModal() {
  if (!props.isAlwaysOpen) {
    emit('modal:closed')
  }
}

function onModalClose() {
  closeModal()
}

watchDebounced(
  width,
  (newWidth, oldWidth) => {
    if (oldWidth && newWidth >= 640) {
      closeModal()
    }
  },
  { debounce: 200, immediate: true }
)
</script>

<template>
  <BaseModalWrapper
    class="relative mx-auto sm:rounded-lg bg-brand-900 border-brand-700 border max-sm:h-full max-sm:max-w-full max-sm:w-full"
    :class="classes"
    wrapper-class="backdrop-filter backdrop-blur bg-black/90 bg-opacity-90 max-sm:z-40"
    v-bind="$attrs"
    @modal:closed="onModalClose"
  >
    <template #default="{ close, isLoading }">
      <div
        :class="{
          'min-h-[320px] flex flex-col': isLoading
        }"
      >
        <div
          class="flex items-center justify-between"
          :class="{ 'mb-6 px-6 pt-6': !isDense }"
        >
          <div class="text-sm uppercase text-gray-100 font-semibold flex-grow">
            <slot name="title" />
          </div>

          <div v-if="!isHideCloseButton">
            <BaseIcon
              name="close"
              class="ml-auto h-5 w-5 min-w-5 text-gray-200 hover:text-blue-500"
              @click="close"
            />
          </div>
        </div>

        <div
          v-if="isLoading"
          class="grow flex items-center justify-center -mt-6"
        >
          <AppSpinner lg />
        </div>
        <div v-else :class="modalContentClass">
          <div :class="[{ 'px-6': !isDense }]">
            <slot />
          </div>

          <div v-if="slots.footer" class="px-6">
            <slot name="footer" />
          </div>

          <div :class="{ 'pb-6': !isDense }" />
        </div>
      </div>
    </template>
  </BaseModalWrapper>
</template>
