<template>
  <div
    class="
      w-full
      p-3
      2xl:p-6
      bg-gray-200
      dark:bg-gray-900
      rounded-2xl
      dark:shadow-dark-sm
      flex flex-col flex-wrap
    "
    v-on="$listeners"
  >
    <p
      class="
        text-gray-700
        dark:text-gray-200
        text-xs
        xs:text-sm
        xl:text-xl
        text-center
      "
    >
      <slot name="value" />
    </p>
    <div
      class="
        mt-1
        mb-2
        xl:mb-3
        text-2xs
        xs:text-xs
        text-center
        h-3
        xs:h-4
        xl:h-6
      "
      v-bind="$attrs"
    >
      <slot name="context"></slot>
    </div>
    <div class="-mt-2 xl:-mt-3 mb-6">
      <slot name="chart"></slot>
    </div>
    <h4
      class="
        text-center text-2xs
        md:text-xs
        font-semibold
        uppercase
        tracking-wider
        text-gray-400
        dark:text-gray-500
      "
    >
      <slot name="title" />
    </h4>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  //
})
</script>
