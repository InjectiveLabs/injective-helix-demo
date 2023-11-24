<script setup lang="ts">
//
</script>

<template>
  <div class="border-b flex justify-between items-center">
    <div>
      <h2 class="text-sm p-2">{{ $t('campaign.allRewards') }}</h2>
    </div>

    <div>
      <p class="text-xs p-2">
        {{ $t('campaign.lastUpdatedAt', { date: '24 Nov 2023' }) }}
      </p>
    </div>
  </div>
</template>
