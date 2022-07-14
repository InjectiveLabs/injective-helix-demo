<template>
  <div
    class="w-full bg-gray-900 rounded-lg shadow-sm flex flex-col flex-wrap"
    :class="{
      'p-3 2xl:p-6': !sm,
      'p-2 2xl:p-4': sm
    }"
    v-on="$listeners"
  >
    <h4
      v-if="$slots['title-horizontal']"
      class="text-2xs md:text-xs font-semibold uppercase tracking-wider text-gray-500 mt-auto"
      :class="{ 'text-left': horizontal, 'text-center': !horizontal }"
    >
      <slot name="title-horizontal" />
    </h4>
    <p
      class="text-gray-200 text-xs xs:text-sm xl:text-xl"
      :class="{
        'text-left': horizontal,
        'text-center': !horizontal,
        'mt-4': $slots['title-horizontal']
      }"
    >
      <slot name="value" />
    </p>
    <slot></slot>
    <div
      v-if="!$slots['title-horizontal']"
      class="text-2xs xs:text-xs text-center h-2 sm:h-3"
      :class="{
        'mt-1 mb-2 xl:mb-3': !sm,
        'mb-1 mt-px xl:mb-2': sm,
        'text-left': horizontal,
        'text-center': !horizontal
      }"
      v-bind="$attrs"
    >
      <slot name="context"></slot>
    </div>
    <div
      v-if="$slots['chart']"
      class="-mt-2 xl:-mt-3"
      :class="{
        'mb-6': !sm,
        'mb-4': sm
      }"
    >
      <slot name="chart"></slot>
    </div>
    <h4
      v-if="$slots['title']"
      class="text-2xs md:text-xs font-semibold uppercase tracking-wider text-gray-500 mt-auto"
      :class="{ 'text-left': horizontal, 'text-center': !horizontal }"
    >
      <slot name="title" />
    </h4>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  props: {
    sm: {
      type: Boolean,
      required: false,
      default: false
    },

    horizontal: {
      type: Boolean,
      required: false,
      default: false
    }
  }
})
</script>
