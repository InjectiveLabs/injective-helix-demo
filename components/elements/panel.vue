<template>
  <v-ui-card class="flex flex-col h-full" small>
    <div
      v-if="title || $slots['title'] || $slots['context']"
      class="border-b items-center flex justify-between px-4 h-12 w-full"
    >
      <h4
        class="uppercase text-xs font-semibold text-gray-300"
        :class="!$slots['context'] ? 'w-full' : ''"
      >
        <slot name="title">{{ title }}</slot>
      </h4>
      <slot name="context" />
    </div>
    <portal-target
      v-if="portalName"
      :name="portalName"
      class="items-center flex justify-between w-full"
    />
    <div :class="contentClass || 'flex w-full flex-1 h-full'">
      <slot ref="content" />
    </div>
  </v-ui-card>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  props: {
    title: {
      required: false,
      default: '',
      type: String
    },

    contentClass: {
      required: false,
      default: '',
      type: String
    },

    portalName: {
      required: false,
      default: '',
      type: String
    }
  }
})
</script>
