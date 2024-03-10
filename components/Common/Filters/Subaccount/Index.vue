<script setup lang="ts">
import { getSubaccountLabel } from '@/app/utils/helpers'

const props = defineProps({
  subaccountIds: {
    type: Array as PropType<string[]>,
    required: true
  },

  modelValue: {
    type: String as PropType<string>,
    required: true
  }
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const subaccountOptions = computed(() =>
  [
    {
      value: '',
      display: 'All'
    },
    ...props.subaccountIds.map((subaccountId) => ({
      value: subaccountId,
      display: getSubaccountLabel(subaccountId)
    }))
  ].sort(
    (a, b) => parseInt(a.value.slice(42), 16) - parseInt(b.value.slice(42), 16)
  )
)

function changeSubaccount(subaccountId: string) {
  emit('update:modelValue', subaccountId)
}
</script>

<template>
  <div class="flex">
    <BaseDropdown :distance="0" class="flex" placement="bottom-start">
      <template #default="{ isOpen }">
        <button class="flex items-center px-8 space-x-4">
          <div
            class="text-sm font-semibold bg-gradient-to-r from-blue-500 to-blue-300 bg-clip-text text-transparent"
          >
            <span class="space-x-2">
              <span>Subaccount:</span>
              <span>
                {{ modelValue ? getSubaccountLabel(modelValue) : 'All' }}
              </span>
            </span>
          </div>

          <span class="transition-all" :class="{ 'rotate-180': isOpen }">
            <BaseIcon name="chevron-down" is-sm />
          </span>
        </button>
      </template>

      <template #content="{ close }">
        <div
          class="bg-brand-900 border border-brand-700 text-white overflow-hidden"
          @click="close"
        >
          <div
            v-for="subaccountId in subaccountOptions"
            :key="subaccountId.value"
            class="px-6 py-4 hover:bg-brand-800 text-sm font-semibold cursor-pointer"
            @click="changeSubaccount(subaccountId.value)"
          >
            {{ subaccountId.display }}
          </div>
        </div>
      </template>
    </BaseDropdown>
  </div>
</template>
