<script lang="ts" setup>
definePageMeta({
  layout: 'blank'
})
</script>

<template>
  <main
    class="min-h-screen bg-brand-900 text-white flex flex-col items-center justify-center px-4 py-16"
  >
    <div class="mb-8 flex flex-col items-center">
      <img src="/icon.png" alt="Helix" class="size-12" />

      <img src="/images/server-stack.png" alt="Server stack" class="w-16" />
    </div>

    <h1 class="text-3xl font-semibold mb-4 text-center">
      {{ $t('maintenance.title') }}
    </h1>
    <p class="text-sm text-center mb-16">
      {{ $t('maintenance.description') }}
    </p>

    <div
      class="w-full max-w-2xl bg-coolGray-850 hover:bg-coolGray-800 cursor-pointer rounded-lg p-6 mb-4 flex items-center mt-20"
    >
      <div class="text-azure-blue-700 mr-4">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      </div>
      <div class="flex-grow">
        <h2 class="text-xl font-bold">{{ $t('maintenance.governance') }}</h2>
        <p class="text-gray-400 text-sm">
          {{ $t('maintenance.governanceDescription') }}
        </p>
      </div>
      <div class="text-gray-400">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
          />
        </svg>
      </div>
    </div>

    <div
      class="w-full max-w-2xl bg-coolGray-850 hover:bg-coolGray-800 cursor-pointer rounded-lg p-6 mb-12 flex items-center"
    >
      <div class="text-azure-blue-700 mr-4">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
      </div>
      <div class="flex-grow">
        <h2 class="text-xl font-bold">{{ $t('maintenance.subscribe') }}</h2>
        <p class="text-gray-400 text-sm">
          {{ $t('maintenance.subscribeDescription') }}
        </p>
      </div>
      <div class="text-gray-400">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
          />
        </svg>
      </div>
    </div>

    <p class="text-center text-sm">
      {{ $t('maintenance.footer') }}
    </p>
  </main>
</template>
