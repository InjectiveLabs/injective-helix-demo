<script setup lang="ts">
withDefaults(
  defineProps<{
    isOpen?: boolean
    wrapperClasses?: string
  }>(),
  {
    isOpen: false,
    wrapperClasses: ''
  }
)
</script>

<template>
  <div class="accordion">
    <div class="content" :class="[isOpen ? 'open' : 'closed']">
      <div :class="wrapperClasses">
        <slot v-bind="{ isOpen }" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.accordion {
  .header {
    user-select: none;
  }

  .content {
    display: grid;
    transition: all 0.3s;
  }
  .content > div {
    overflow: hidden;
  }
  .open {
    grid-template-rows: 1fr;
  }
  .closed {
    grid-template-rows: 0fr;
  }
}
</style>
