<script lang="ts" setup>
  const uuid = `${Math.random()}`
</script>

<template>
  <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
  <g :clip-path="`url(#phantom-${uuid}-1)`">
    <path
      d="M20 40C31.0457 40 40 31.0457 40 20C40 8.95431 31.0457 0 20 0C8.95431 0 0 8.95431 0 20C0 31.0457 8.95431 40 20 40Z"
      :fill="`url(#phantom-${uuid}-2)`" />
    <path
      d="M34.3179 20.2437H30.7921C30.7921 13.0585 24.9471 7.23404 17.7362 7.23404C10.6148 7.23404 4.82492 12.9159 4.68321 19.978C4.53661 27.278 11.4097 33.6171 18.7366 33.6171H19.6582C26.1178 33.6171 34.7755 28.5784 36.1282 22.4391C36.378 21.3074 35.481 20.2437 34.3179 20.2437ZM12.4968 20.5638C12.4968 21.5246 11.7082 22.3105 10.7439 22.3105C9.7796 22.3105 8.99096 21.5242 8.99096 20.5638V17.738C8.99096 16.7772 9.7796 15.9913 10.7439 15.9913C11.7082 15.9913 12.4968 16.7772 12.4968 17.738V20.5638ZM18.5837 20.5638C18.5837 21.5246 17.7951 22.3105 16.8308 22.3105C15.8665 22.3105 15.0779 21.5242 15.0779 20.5638V17.738C15.0779 16.7772 15.8668 15.9913 16.8308 15.9913C17.7951 15.9913 18.5837 16.7772 18.5837 17.738V20.5638Z"
      :fill="`url(#phantom-${uuid}-3)`" />
  </g>
  <defs>
    <linearGradient :id="`phantom-${uuid}-2`" x1="20" y1="0" x2="20" y2="40" gradientUnits="userSpaceOnUse">
      <stop stop-color="#534BB1" />
      <stop offset="1" stop-color="#551BF9" />
    </linearGradient>
    <linearGradient :id="`phantom-${uuid}-3`" x1="20.4255" y1="7.23404" x2="20.4255" y2="33.6171"
      gradientUnits="userSpaceOnUse">
      <stop stop-color="white" />
      <stop offset="1" stop-color="white" stop-opacity="0.82" />
    </linearGradient>
    <clipPath :id="`phantom-${uuid}-1`">
      <rect width="40" height="40" fill="white" />
    </clipPath>
  </defs>
</svg>
</template>
