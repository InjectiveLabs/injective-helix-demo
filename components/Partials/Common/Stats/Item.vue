<script lang="ts" setup>
withDefaults(defineProps<{ isSm?: boolean; isHorizontal?: boolean }>(), {
  isSm: false,
  isHorizontal: false
})
</script>

<template>
  <div
    class="w-full bg-coolGray-950 rounded-lg shadow-sm flex flex-col flex-wrap"
    :class="{
      'p-3 2xl:p-6': !isSm,
      'p-2 2xl:p-4': isSm
    }"
  >
    <h4
      v-if="$slots['title-horizontal']"
      class="text-xs md:text-xs font-semibold uppercase tracking-wider text-coolGray-500 mt-auto"
      :class="{
        'text-left': isHorizontal,
        'text-center': !isHorizontal
      }"
    >
      <slot name="title-horizontal" />
    </h4>
    <p
      class="text-coolGray-200 text-xs xs:text-sm xl:text-xl"
      :class="{
        'text-left': isHorizontal,
        'text-center': !isHorizontal,
        'mt-4': $slots['title-horizontal']
      }"
    >
      <slot name="value" />
    </p>

    <slot />

    <div
      v-if="!$slots['title-horizontal']"
      class="text-xs xs:text-xs text-center h-2 sm:h-3"
      :class="{
        'mt-1 mb-2 xl:mb-3': !isSm,
        'mb-1 mt-px xl:mb-2': isSm,
        'text-left': isHorizontal,
        'text-center': !isHorizontal
      }"
      v-bind="$attrs"
    >
      <slot name="context" />
    </div>
    <div
      v-if="$slots['chart']"
      class="-mt-2 xl:-mt-3"
      :class="{
        'mb-6': !isSm,
        'mb-4': isSm
      }"
    >
      <slot name="chart" />
    </div>
    <h4
      v-if="$slots['title']"
      class="text-xs md:text-xs font-semibold uppercase tracking-wider text-coolGray-500 mt-auto"
      :class="{
        'text-left': isHorizontal,
        'text-center': !isHorizontal
      }"
    >
      <slot name="title" />
    </h4>
  </div>
</template>
