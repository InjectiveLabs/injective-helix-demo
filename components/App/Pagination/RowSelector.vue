<script lang="ts" setup>
const props = defineProps({
  limit: {
    type: Number,
    required: true
  },

  options: {
    type: Array as PropType<number[]>,
    default: () => []
  },

  selectedClass: {
    type: String,
    default: ''
  }
})

const emit = defineEmits<{
  'update:modelValue': [state: number]
}>()

const selectedOption = computed(() =>
  props.options.find((option) => option === props.limit)
)

function onLimitChange(limit: any) {
  emit('update:modelValue', limit)
}
</script>

<template>
  <SharedDropdown class="inline-block" placement="top-end">
    <template #default="{ isOpen }">
      <div
        class="flex items-center gap-2 rounded"
        :classes="selectedClass || 'border border-gray-400 py-2 px-3'"
      >
        <span v-if="selectedOption" class="font-semibold text-white text-sm">
          {{ selectedOption }}
        </span>

        <div>
          <SharedIcon
            name="chevron-down"
            class="h-4 w-4 min-w-4 rotate-180"
            :class="{
              'ease-in-out duration-300 rotate-0': isOpen
            }"
          />
        </div>
      </div>
    </template>

    <template #content="{ close }">
      <div class="p-2 bg-gray-850 shadow-sm">
        <SharedSelectorItem
          v-for="item in options"
          :key="`selector-row-item-${item}`"
          :value="item.toString()"
          :model-value="limit"
          @update:modelValue="onLimitChange"
          @click="close"
        >
          <template #default="{ isActive }">
            <div
              class="group flex cursor-pointer items-center justify-between rounded hover:bg-blue-500 p-2 gap-2 text-sm"
            >
              <span
                class="font-semibold group-hover:text-black text-sm"
                :class="{
                  'text-white': !isActive,
                  'text-blue-500': isActive
                }"
              >
                {{ item }}
              </span>
            </div>
          </template>
        </SharedSelectorItem>
      </div>
    </template>
  </SharedDropdown>
</template>
