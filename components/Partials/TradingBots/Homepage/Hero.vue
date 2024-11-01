<script setup lang="ts">
//
</script>

<template>
  <div class="flex flex-col items-center text-center max-w-2xl mx-auto">
    <h1 class="font-bold text-6xl">
      <span>{{ $t('helix') }} {{ ' ' }}</span>
      <span class="rounded-2xl bg-yellow-500 px-2 text-black">
        {{ $t('tradingBots.title') }}
      </span>
    </h1>
    <p class="text-xl mt-4">
      {{ $t('tradingBots.description') }}
    </p>

    <div>
      <div class="flex justify-between mt-4">
        <div class="text-center p-4">
          <h2 class="text-sm font-semibold text-zinc-600">
            {{ $t('tradingBots.activeBots') }}
          </h2>
          <p class="text-2xl font-bold">123 TODO</p>
        </div>
        <div class="text-center p-4">
          <h2 class="text-sm font-semibold text-zinc-600">
            {{ $t('tradingBots.totalBotsCreated') }}
          </h2>
          <p class="text-2xl font-bold">456 TODO</p>
        </div>
      </div>
    </div>

    <div class="flex gap-4 mt-4">
      <UButton class="px-8 py-2">
        {{ $t('tradingBots.setUpNewBot') }}
      </UButton>
      <UButton class="px-8 py-2" color="white" variant="outline">
        {{ $t('common.learnMore') }}
      </UButton>
    </div>
  </div>
</template>
