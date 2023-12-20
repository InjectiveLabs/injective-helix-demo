<script lang="ts" setup>
import { DropdownOptionWithToken } from '@/types'

const props = defineProps({
  isClearable: Boolean,
  isSearchable: Boolean,
  isDisabled: Boolean,

  options: {
    type: Array as PropType<DropdownOptionWithToken[]>,
    default: () => []
  },

  modelValue: {
    type: String,
    default: ''
  },

  placeholder: {
    type: String,
    default: 'Select'
  },

  selectedClass: {
    type: String,
    default: ''
  },

  popperClass: {
    type: String,
    default: 'dropdown'
  }
})

const emit = defineEmits<{
  'update:modelValue': [state: string]
}>()

const uuid = Math.random()
const search = ref('')

const value = computed({
  get: (): string | undefined => props.modelValue,
  set: (value?: string) => {
    if (value) {
      emit('update:modelValue', value)
    }
  }
})

const selectedItem = computed(() =>
  props.options.find(({ value }) => value === props.modelValue)
)

const filteredList = computed(() => {
  return props.options.filter((option) => {
    const searchTrimmed = search.value.toLocaleLowerCase().trim()

    if (!searchTrimmed) {
      return true
    }

    return option.display.toLowerCase().startsWith(searchTrimmed)
  })
})

function handleClear() {
  emit('update:modelValue', '')
}
</script>

<template>
  <BaseDropdown
    class="w-full"
    :disabled="isDisabled"
    :delay="300"
    auto-size="true"
    auto-boundary-max-size
    :popper-class="popperClass"
  >
    <template #default="{ isOpen }">
      <div
        class="flex items-center justify-between px-4 h-10 box-border bg-gray-1000 border rounded-lg cursor-pointer text-sm"
        :class="[
          selectedClass,
          isOpen ? 'border-blue-500' : 'border-transparent'
        ]"
      >
        <slot name="selected-option" :option="selectedItem">
          <div>
            <span v-if="selectedItem" class="text-white text-sm">
              {{ selectedItem.display }}
            </span>

            <span v-else class="text-gray-500 text-sm">{{ placeholder }}</span>
          </div>
        </slot>

        <div v-if="!isDisabled" class="flex items-center gap-2">
          <BaseIcon
            v-if="isClearable && selectedItem"
            name="close"
            class="min-w-4 w-4 h-4 text-gray-500 hover:text-white"
            @click.stop="handleClear"
          />

          <BaseIcon
            name="caret-down-thick"
            class="ease-in-out duration-300 min-w-3 w-3 h-3"
            :class="{
              'text-gray-500': !isOpen,
              'text-blue-500 rotate-180': isOpen
            }"
          />
        </div>
      </div>
    </template>

    <template #content="{ close }">
      <slot name="list">
        <div class="p-2 py-4 max-h-xs space-y-3" @click.stop>
          <AppInput
            v-if="isSearchable"
            v-model="search"
            class="text-white"
            is-sm
            is-bg-transparent
            :placeholder="$t('common.search')"
          />

          <div>
            <AppSelectFieldItem
              v-for="item in filteredList"
              :key="`${uuid}-${item}`"
              v-model="value"
              :value="item.value"
              @update:modelValue="close"
            >
              <template #default="{ isActive }">
                <slot name="option" :option="item" :is-active="isActive">
                  <div
                    :class="{
                      'text-white': !isActive,
                      'text-blue-500 group-hover:text-white': isActive
                    }"
                  >
                    <span>
                      {{ item.display }}
                    </span>
                  </div>
                </slot>
              </template>
            </AppSelectFieldItem>
          </div>
        </div>
      </slot>
    </template>
  </BaseDropdown>
</template>

<style>
.dropdown.v-popper--theme-dropdown .v-popper__inner {
  @apply bg-gray-850 border-blue-300 border shadow-sm;
}
</style>
