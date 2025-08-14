<script lang="ts" setup>
const emit = defineEmits<{
  'limitOrder:select': []
  'marketOrder:select': []
}>()

withDefaults(
  defineProps<{
    isMarketPositionClose?: boolean
  }>(),
  {}
)

function onClickMarketClose() {
  emit('marketOrder:select')
}

function onClickLimitClose() {
  emit('limitOrder:select')
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
      {{ $t('trade.partialClosePositionModal.marketClose') }}
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
      {{ $t('trade.partialClosePositionModal.limitClose') }}
    </span>
  </div>
</template>
