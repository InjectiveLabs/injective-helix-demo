<script setup lang="ts">
const id = useId()
</script>

<template>
  <svg
    class="select-none pointer-events-none"
    height="2000"
    width="2000"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <filter :id="`${id}-f1`" x="-20" y="-20" height="100" width="100">
        <feGaussianBlur in="SourceGraphic" stdDeviation="200" />
      </filter>
    </defs>
    <g stroke="none" fill="currentColor">
      <ellipse
        cx="1000"
        cy="1000"
        rx="500"
        ry="500"
        :filter="`url(#${id}-f1)`"
      />
    </g>
  </svg>
</template>
