<template>
  <div
    class="epoch-item py-4 px-5 hover:bg-gray-900 text-gray-200"
    @click="handleClick"
  >
    <span>
      {{ $t('dmm.epoch.prefix') }}
      <span class="epoch-item-text">
        <slot />
        <span v-if="active">({{ $t('dmm.epoch.current') }})</span>
      </span>
    </span>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  props: {
    item: {
      type: Object,
      required: true
    },

    active: {
      type: Boolean,
      default: false
    }
  },

  methods: {
    handleClick() {
      const { item } = this

      this.$emit('click', item)
    }
  }
})
</script>

<style lang="scss" scoped>
.epoch-item {
  &:hover {
    .epoch-item-text {
      @apply text-primary-500;
    }
  }
}
</style>
