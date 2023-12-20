<script lang="ts" setup>
const slots = useSlots()

defineProps({
  htmlUrl: {
    type: String,
    required: true
  }
})
</script>

<template>
  <CommonCard
    is-md
    :class="
      !slots.illustration ? 'bg-gray-100 max-w-[375px]' : 'bg-transparent'
    "
    :bg-color="'bg-gray-150'"
    :is-no-padding="slots.illustration ? true : false"
    class="text-xl relative"
  >
    <NuxtLink
      :href="htmlUrl"
      class="hover:text-black hover:cursor-pointer text-gray-900 flex-1 flex flex-col gap-2 h-full"
      target="_blank"
    >
      <div v-if="!slots.illustration" class="flex justify-between">
        <slot name="date" />
        <BaseIcon name="arrow" class="text-blue-500 rotate-180 h-5 w-5" />
      </div>
      <div v-if="!slots.illustration" class="font-semibold">
        <slot name="title" />
      </div>
      <div class="overflow-hidden h-full">
        <slot name="illustration" />
      </div>
    </NuxtLink>
  </CommonCard>
</template>
