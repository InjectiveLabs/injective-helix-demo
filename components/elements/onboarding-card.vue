<template>
  <VCard>
    <div class="relative h-full p-2">
      <div class="flex flex-col flex-wrap h-full">
        <div class="w-full">
          <h3 class="font-semibold text-lg text-gray-100">
            <slot name="title" />
          </h3>
        </div>
        <p class="text-gray-300 tracking-tight text-sm mt-4 h-20">
          <slot></slot>
        </p>
        <div class="text-sm mt-auto font-semibold">
          <slot name="link" />
        </div>
      </div>
    </div>
  </VCard>
</template>

<script>
import Vue from 'vue'

export default Vue.extend({
  //
})
</script>
