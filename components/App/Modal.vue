<script lang="ts" setup>
import { twMerge } from 'tailwind-merge'
import { NuxtUiIcons } from '@shared/types'

const slots = useSlots()
const { width } = useWindowSize()

const props = withDefaults(
  defineProps<{
    isLg?: boolean
    isMd?: boolean
    isSm?: boolean
    isOpen?: boolean
    isDense?: boolean
    parentClass?: string
    isAlwaysOpen?: boolean
    isTransparent?: boolean
    isHideCloseButton?: boolean
    isStayOpenOnResize?: boolean
    modalContentClass?: string
  }>(),
  {
    isLg: false,
    isMd: false,
    isSm: false,
    isOpen: false,
    isDense: false,
    parentClass: '',
    isAlwaysOpen: false,
    isTransparent: false,
    isHideCloseButton: false,
    modalContentClass: ''
  }
)

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
    if (oldWidth && newWidth >= 640 && !props.isStayOpenOnResize) {
      closeModal()
    }
  },
  { debounce: 200, immediate: true }
)
</script>

<template>
  <Transition name="modal" appear>
    <SharedModalWrapper
      v-if="isOpen"
      class="relative mx-auto sm:rounded-lg border-brand-700 border max-sm:h-full max-sm:max-w-full max-sm:w-full modalWrapper"
      :class="
        twMerge(
          parentClass,
          isTransparent ? 'bg-brand-900/95' : 'bg-brand-900',
          classes
        )
      "
      wrapper-class="backdrop-filter backdrop-blur-sm bg-black/30  max-sm:z-40"
      v-bind="$attrs"
      :ignore="['.v-popper__inner']"
      @modal:closed="onModalClose"
    >
      <template #default="{ close, isLoading }">
        <div
          :class="{
            'min-h-[320px] flex flex-col': isLoading
          }"
        >
          <div
            class="flex items-center"
            :class="[
              { 'px-6 pt-6': !isDense },
              $slots.title ? 'justify-between mb-6 ' : 'justify-end mb-4'
            ]"
          >
            <div
              v-if="$slots.title"
              class="text-sm uppercase text-coolGray-100 font-semibold flex-grow"
            >
              <slot name="title" />
            </div>

            <div v-if="!isHideCloseButton">
              <UIcon
                :name="NuxtUiIcons.Close"
                class="h-5 w-5 min-w-5 text-coolGray-200 hover:text-blue-500"
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
    </SharedModalWrapper>
  </Transition>
</template>

<style>
.modalWrapper > div {
  @media screen and (max-width: 640px) {
    vertical-align: top;
  }
}

.modal-enter-from,
.modal-leave-to {
  @apply opacity-0;
}

.modal-leave-active .modal-container {
  transition: 300ms cubic-bezier(0.4, 0, 1, 1);
  transform: scale(0.9);
}
</style>
