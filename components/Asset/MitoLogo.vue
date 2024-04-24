<script lang="ts" setup>
const uuid = `${Math.random()}`
</script>

<template>
  <svg
    class="w-8 h-8 object-fill"
    viewBox="0 0 30 50"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <g :clip-path="`url(#mito-${uuid})`">
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M12.6445 0.429798C12.3419 -0.0942909 11.5854 -0.09429 11.2829 0.429799L0.389877 19.297C-0.215289 20.3452 0.541169 21.6554 1.7515 21.6554H9.94216L17.4206 8.70231L12.6445 0.429798Z"
        fill="#70E766"
      />
      <path
        d="M17.3935 16.5088L20.7976 21.8152H13.9895L17.3935 16.5088Z"
        fill="#02C57F"
      />
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M23.5766 0.393066C23.274 -0.131023 22.5175 -0.131021 22.2149 0.393067L17.4216 8.69538L24.8828 21.6187H33.1079C34.3182 21.6187 35.0747 20.3084 34.4695 19.2603L23.5766 0.393066Z"
        fill="#02C57F"
      />
    </g>
    <defs>
      <clipPath :id="`mito-${uuid}`">
        <rect width="118.642" height="24" fill="white" />
      </clipPath>
    </defs>
  </svg>
</template>
