<script lang="ts" setup>
const emit = defineEmits<{
  'on:select': [value: boolean]
}>()

withDefaults(
  defineProps<{
    isMarketPositionClose?: boolean
  }>(),
  {}
)

function onClickMarketClose() {
  emit('on:select', true)
}

function onClickLimitClose() {
  emit('on:select', false)
}
</script>

<template>
  <div class="flex mt-6 mb-8 cursor-pointer">
    <span
      class="w-1/2 text-sm font-medium p-4 text-center"
      :class="[
        !isMarketPositionClose
          ? 'border-gray-600 border-b'
          : 'border-[#9ECAFF] border-b-2'
      ]"
      @click="onClickMarketClose"
    >
      {{ $t('partialClosePosition.marketClose') }}
    </span>

    <span
      class="w-1/2 text-sm font-medium p-4 text-center"
      :class="[
        isMarketPositionClose
          ? 'border-gray-600 border-b'
          : 'border-[#9ECAFF] border-b-2'
      ]"
      @click="onClickLimitClose"
    >
      {{ $t('partialClosePosition.limitClose') }}
    </span>
  </div>
</template>
