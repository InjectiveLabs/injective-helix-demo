<template>
  <div class="step-circle" :class="{ active }">
    <div>
      <div class="circle">
        <slot name="circle"></slot>
      </div>
    </div>
    <div>
      <div class="title"><slot name="title"></slot></div>
      <div class="caption"><slot></slot></div>
    </div>
  </div>
</template>

<script>
import Vue from 'vue'

export default Vue.extend({
  props: {
    active: {
      type: Boolean,
      default: false
    }
  }
})
</script>
