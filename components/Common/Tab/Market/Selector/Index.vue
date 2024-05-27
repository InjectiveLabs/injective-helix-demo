<script setup lang="ts">
import { UiMarketWithToken } from '@/types'

const props = defineProps({
  markets: {
    type: Array as PropType<UiMarketWithToken[]>,
    required: true
  },

  modelValue: {
    type: String,
    default: ''
  },

  wrapperClass: {
    type: String,
    default: ''
  }
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const isOpen = ref(false)

function openModal() {
  isOpen.value = true
}

function closeModal() {
  isOpen.value = false
}

function setMarket(market: UiMarketWithToken) {
  isOpen.value = false
  emit('update:modelValue', market.marketId)
}

const activeMarket = computed(() =>
  props.markets.find((market) => market.marketId === props.modelValue)
)
</script>

<template>
  <div
    class="flex items-center tab-label px-2 max-lg:py-2 lg:px-8"
    :class="wrapperClass"
    @click="openModal"
  >
    <p v-if="!activeMarket">{{ 'Filter By Market' }}</p>

    <p v-else>
      {{ activeMarket?.ticker }}
    </p>

    <div class="flex items-center pl-2">
      <div class="transition-all" :class="{ 'rotate-180': isOpen }">
        <SharedIcon name="chevron-down" is-sm />
      </div>
    </div>
  </div>

  <AppHocModal v-bind="{ isOpen }" @modal:close="closeModal">
    <CommonMarketSelector v-bind="{ markets }" @set:market="setMarket" />
  </AppHocModal>
</template>
