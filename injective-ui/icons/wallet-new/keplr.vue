<script lang="ts" setup>
const uuid = `${Math.random()}`
</script>

<template>
  <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g :clip-path="`url(#keplr-${uuid}-1)`">
      <path
        d="M40 30.2639V9.7361C40 4.359 35.641 0 30.2639 0L9.7361 0C4.359 0 0 4.359 0 9.7361V30.2639C0 35.641 4.359 40 9.7361 40H30.2639C35.641 40 40 35.641 40 30.2639Z"
        :fill="`url(#keplr-${uuid}-2)`" />
      <path opacity="0.9"
        d="M40 30.2639V9.7361C40 4.359 35.641 0 30.2639 0L9.7361 0C4.359 0 0 4.359 0 9.7361V30.2639C0 35.641 4.359 40 9.7361 40H30.2639C35.641 40 40 35.641 40 30.2639Z"
        :fill="`url(#keplr-${uuid}-3)`" />
      <path opacity="0.9"
        d="M30.2639 6.10352e-05H9.7361C4.359 6.10352e-05 0 4.35906 0 9.73616V30.264C0 35.6411 4.359 40.0001 9.7361 40.0001H30.2639C35.641 40.0001 40 35.6411 40 30.264V9.73616C40 4.35906 35.641 6.10352e-05 30.2639 6.10352e-05Z"
        :fill="`url(#keplr-${uuid}-4)`"  />
      <path
        d="M16.2745 30.4458V21.1937L24.971 30.4458H29.8089V30.207L19.8065 19.6716L29.0372 9.67343V9.55405H24.1696L16.2745 18.3883V9.55405H12.3567V30.4458H16.2745Z"
        :fill="`url(#keplr-${uuid}-5)`" />
    </g>
    <defs>
      <linearGradient :id="`keplr-${uuid}-2`" x1="41.4013" y1="21.9743" x2="-4.45857" y2="-1.21019"
        gradientUnits="userSpaceOnUse">
        <stop offset="0.210712" stop-color="#457CD6" />
        <stop offset="0.681753" stop-color="#58ADE9" />
        <stop offset="0.943139" stop-color="#71C4FF" />
      </linearGradient>
      <linearGradient :id="`keplr-${uuid}-3`" x1="17.1338" y1="1.65605" x2="4.71338" y2="35.7962"
        gradientUnits="userSpaceOnUse">
        <stop stop-color="#457CD6" stop-opacity="0" />
        <stop offset="0.286458" stop-color="#58ADE9" stop-opacity="0" />
        <stop offset="0.570545" stop-color="#AF75EA" stop-opacity="0.3" />
        <stop offset="1" stop-color="#8557E8" stop-opacity="0.8" />
      </linearGradient>
      <linearGradient :id="`keplr-${uuid}-4`" x1="-1.9348e-06" y1="-0.827963" x2="40" y2="38.5351"
        gradientUnits="userSpaceOnUse">
        <stop offset="0.0688789" stop-color="#457CD6" stop-opacity="0" />
        <stop offset="0.286458" stop-color="#58ADE9" stop-opacity="0" />
        <stop offset="0.466157" stop-color="#B594FB" stop-opacity="0" />
        <stop offset="0.634398" stop-color="#D483FB" stop-opacity="0.2" />
        <stop offset="0.899464" stop-color="#BE6CFF" stop-opacity="0.8" />
        <stop offset="1" stop-color="#B969F8" stop-opacity="0.85" />
      </linearGradient>
      <linearGradient :id="`keplr-${uuid}-5`" x1="21.0828" y1="9.55405" x2="21.0828" y2="30.4458"
        gradientUnits="userSpaceOnUse">
        <stop stop-color="white" />
      </linearGradient>
      <clipPath :id="`keplr-${uuid}-1`">
        <rect width="40" height="40" fill="white" />
      </clipPath>
    </defs>
  </svg>
</template>
