<script lang="ts" setup>
import { BaseDropdownOption } from '@injectivelabs/ui-shared'

const props = defineProps({
  option: {
    type: Object as PropType<BaseDropdownOption>,
    required: true
  }
})

const spotStore = useSpotStore()

const token = computed(
  () => spotStore.markets.find((m) => m.slug === props.option?.value)!.baseToken
)
</script>

<template>
  <div class="flex mr-auto items-center space-x-2 font-semibold tracking-wide">
    <CommonTokenIcon v-bind="{ isSm: true, token }" />
    <div class="mr-auto">{{ option?.display }}</div>
  </div>
</template>
