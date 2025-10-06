<script lang="ts" setup>
  const uuid = `${Math.random()}`
</script>

<template>
  <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g :clip-path="`url(#ninji-${uuid})`">
      <path d="M0.156311 13.457L5.43931 18.708H13.363V34.517L18.6363 39.839V18.7227L13.4003 13.457H0.156311Z"
        fill="#FF3300" />
      <path d="M39.8436 21.3747H26.554V5.50268L21.2806 0.161011V21.36L26.5996 26.6257H34.52L39.8436 21.3747Z"
        fill="#FF3300" />
    </g>
    <defs>
      <clipPath :id="`ninji-${uuid}`">
        <rect width="40" height="40" fill="white" />
      </clipPath>
    </defs>
  </svg>
</template>
