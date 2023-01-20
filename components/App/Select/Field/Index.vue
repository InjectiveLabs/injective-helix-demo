<script lang="ts" setup>
import { PropType } from 'vue'
import { BaseDropdownOption } from '@injectivelabs/ui-shared'

const slots = useSlots()

const props = defineProps({
  clearable: Boolean,

  modelValue: {
    type: String,
    default: ''
  },

  options: {
    type: Array as PropType<BaseDropdownOption[]>,
    default: () => []
  },

  placeholder: {
    type: String,
    default: 'Select'
  },

  searchable: Boolean,

  selectedClass: {
    type: String,
    default: ''
  }
})

const emit = defineEmits<{
  (e: 'update:modelValue', state: string): void
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

function handleClear(e: any) {
  e.stopPropagation()

  emit('update:modelValue', '')
}
</script>

<template>
  <BaseDropdown
    class="w-full"
    auto-size="true"
    auto-boundary-max-size
    popper-class="dropdown"
  >
    <template #default="{ shown }">
      <div
        class="flex items-center justify-between px-4 h-10 box-border bg-gray-1000 border rounded-lg cursor-pointer text-sm"
        :class="[
          selectedClass,
          shown ? 'border-blue-500' : 'border-transparent'
        ]"
      >
        <template v-if="!slots['selected-option'] || !selectedItem">
          <span v-if="selectedItem" class="text-white text-sm">
            {{ selectedItem.display }}
          </span>

          <span v-else class="text-gray-500 text-sm">{{ placeholder }}</span>
        </template>

        <slot v-else name="selected-option" :option="selectedItem" />

        <div class="flex items-center gap-2">
          <BaseIcon
            v-if="clearable && selectedItem"
            name="close"
            class="min-w-4 w-4 h-4 text-gray-500 hover:text-white"
            @click="handleClear"
          />

          <BaseIcon
            name="caret-down-thick"
            class="ease-in-out duration-300 min-w-3 w-3 h-3"
            :class="{
              'text-gray-500': !shown,
              'text-blue-500 rotate-180': shown
            }"
          />
        </div>
      </div>
    </template>

    <template #content="{ close }">
      <slot name="list">
        <div class="p-2 py-4 max-h-xs space-y-3" @click.stop>
          <AppInput
            v-if="searchable"
            v-model="search"
            sm
            bg-transparent
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
              <template #default="{ active }">
                <div v-if="!slots['option']">
                  <span
                    :class="{
                      'text-white': !active,
                      'text-blue-500': active
                    }"
                  >
                    {{ item.display }}
                  </span>
                </div>

                <slot v-else name="option" :option="item" :active="active" />
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
