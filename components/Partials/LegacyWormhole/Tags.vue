<script lang="ts" setup>
defineProps({
  isLegacy: Boolean,
  isTooltip: Boolean,
  isActionRequired: Boolean
})
</script>

<template>
  <BaseIcon
    v-if="isTooltip"
    name="exclamation-circle-fill"
    class="text-orange-300 w-4 h-4 min-w-4"
  />

  <div v-else class="bg-orange-300 rounded-[4px] font-semibold inline-flex">
    <div
      v-if="isLegacy"
      class="p-1 text-gray-1100 leading-3 uppercase text-[10px]"
    >
      {{ $t('common.legacy.title') }}
    </div>

    <div
      v-else-if="isActionRequired"
      class="inline-flex py-0.5 px-1 justify-center items-center gap-0.5"
    >
      <span>
        <BaseIcon
          name="exclamation-circle-fill"
          class="text-black w-4 h-4 min-w-4 cursor-normal"
        />
      </span>

      <span class="text-black leading-3 uppercase text-[10px]">
        {{ $t('common.legacy.actionRequired') }}
      </span>
    </div>
  </div>
</template>
