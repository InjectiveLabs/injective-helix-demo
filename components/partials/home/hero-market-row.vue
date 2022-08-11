<template>
  <div
    class="grid grid-cols-12 items-center border-b border-helixGray-200 last-of-type:border-b-0 py-4 gap-12 box-content"
  >
    <div class="col-span-4 flex items-center justify-start pl-4">
      <div class="min-w-4 min-h-4 bg-orange-500 rounded-full mr-3" />
      <div class="flex flex-col">
        <span
          class="text-helixGray-500 text-sm font-bold whitespace-nowrap mb-1"
        >
          BTC/USDT PERP
        </span>
        <span class="text-helixGray-300 text-xs"> Bitcoin </span>
      </div>
    </div>
    <div class="col-span-3 flex">
      <span class="w-full text-gray-900 font-medium text-sm text-right">
        20,866.45
      </span>
    </div>
    <div class="col-span-2 flex">
      <span class="w-full text-red-500 font-medium text-sm">
        -4.59%
      </span>
    </div>
    <div class="col-span-3 flex text-red-500 pr-4">
      <svg
        class="w-full"
        width="80"
        height="30"
        viewBox="0 0 80 30"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M1.02341 15.082C1.02341 14.2067 0.717888 10.388 2.31448 10.388C3.84009 10.388 4.13874 12.5185 4.99228 13.2802C6.00454 14.1836 9.55764 4.74814 10.1566 3.56036C10.4055 3.06676 11.271 1 11.7824 1C12.7016 1 14.1557 5.54681 14.4602 6.45262C14.9086 7.78656 16.0314 9.31163 16.086 10.7199C16.1138 11.4382 16.2872 11.8774 16.612 12.5216C17.2029 13.6934 17.108 12.4927 17.6162 11.6682C17.9647 11.1026 20.0268 8.04659 21.0112 8.32547C21.7462 8.53369 22.2728 12.4056 22.5414 13.138C24.2275 17.7356 25.3483 8.77398 27.0841 11.4785C27.9864 12.8844 28.1652 15.1403 29.212 16.3859C30.1398 17.4899 30.9879 19.5242 31.5789 20.8428C32.0602 21.9165 32.8121 22.7405 33.3004 23.8299C33.6446 24.5978 34.1775 26.5908 35.0218 26.9355C36.091 27.372 37.4043 19.6029 37.604 18.9225C38.5639 15.6506 39.0864 12.3555 41.0468 9.4397C42.9812 6.56259 44.679 15.2677 45.4461 16.7889C47.6016 21.0636 48.3005 13.5208 50.9451 13.3751C54.8507 13.1599 54.1762 22.0639 57.9743 16.2436C58.6871 15.1514 59.1965 14.1362 59.9827 13.1617C60.4695 12.5583 63.1408 15.0868 63.4255 15.7221C65.9138 21.2734 67.3978 16.1941 68.5964 13.138C69.2426 11.4903 69.5738 8.65196 70.0826 6.8861C70.3018 6.12541 72.1759 1.92365 72.8934 4.41381C73.395 6.15453 75.0367 14.5098 75.0367 16.3859C76.019 24.8223 76.5229 26.0526 79 29"
          stroke="currentColor"
          stroke-linecap="round"
        />
      </svg>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({})
</script>
