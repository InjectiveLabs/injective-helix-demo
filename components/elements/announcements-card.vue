<template>
  <VCard
    md
    :class="
      !$slots.illustration ? 'bg-gray-100 max-w-[375px]' : 'bg-transparent'
    "
    :bg-color="bgColor"
    :no-padding="$slots.illustration ? true : false"
    class="text-xl h-full"
  >
    <a
      :href="htmlUrl"
      class="hover:text-black hover:cursor-pointer text-gray-900 flex-1 flex flex-col gap-2 h-full"
      target="_blank"
    >
      <div v-if="!$slots.illustration" class="flex justify-between">
        <slot name="date" />
        <IconArrow class="text-primary-500 rotate-180 h-5 w-5" />
      </div>
      <div v-if="!$slots.illustration" class="font-semibold">
        <slot name="title" />
      </div>
      <div class="overflow-hidden h-full">
        <slot name="illustration" />
      </div>
    </a>
  </VCard>
</template>
<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  props: {
    htmlUrl: {
      type: String,
      default: ''
    }
  },

  data() {
    return {
      bgColor: 'bg-gray-150'
    }
  }
})
</script>
