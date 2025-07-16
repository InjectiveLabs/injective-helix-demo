<script lang="ts" setup></script>

<template>
  <div
    class="py-3.5 px-5 flex items-center gap-4 border border-white rounded-2xl max-w-96"
  >
    <SharedQRCode
      class="rounded-lg lg:w-24 lg:min-w-24 w-20 min-w-20"
      v-bind="{
        text: 'https://helixapp.com/mobile'
      }"
    />

    <span class="font-medium text-left">
      {{ $t('home.downloadHelixMobile') }}
    </span>
  </div>
</template>
