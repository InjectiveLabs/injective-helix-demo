<template>
  <div class="flex flex-col">
    <div
      v-if="title || $slots['title'] || $slots['title-context']"
      class="flex justify-between items-center"
    >
      <h3 class="text-xl font-bold text-gray-200">
        <slot name="title">{{ title }}</slot>
        <slot name="subtitle"></slot>
      </h3>
      <slot name="title-context" />
    </div>
    <slot name="context" />
    <VCard class="relative flex-1" :lg="!dense" :class="[cardWrapperClass]">
      <div class="v-panel-content">
        <slot ref="content" />
      </div>
    </VCard>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  props: {
    dense: {
      type: Boolean,
      default: false
    },

    title: {
      default: '',
      type: String
    },

    portalName: {
      default: '',
      type: String
    },

    cardWrapperClass: {
      default: '',
      type: String
    }
  }
})
</script>
