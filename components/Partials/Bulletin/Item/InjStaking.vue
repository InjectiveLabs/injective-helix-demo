<script setup lang="ts">
import { INJ_DENOM } from '@injectivelabs/utils'

const tokenStore = useTokenStore()

const token = computed(() =>
  tokenStore.tradeableTokens.find((token) => token.denom === INJ_DENOM)
)
</script>

<template>
  <NuxtLink
    v-if="token"
    to="https://hub.injective.network/staking"
    target="_blank"
    class="card px-4 py-6 hover:bg-gray-750"
  >
    <div class="flex space-x-4">
      <div class="relative mt-1">
        <CommonTokenIcon is-lg v-bind="{ token }" />
      </div>

      <div>
        <p class="text-xl font-semibold">{{ $t('injStaking') }}</p>
        <p class="text-gray-400 text-xs">Injective - {{ $t('Staking') }}</p>
      </div>
    </div>

    <div class="grid grid-cols-2 mt-8">
      <div>
        <p>{{ $t('campaign.apy') }}</p>
        <p class="text-xl font-semibold text-green-500">
          <span>14.5%</span>
        </p>
      </div>
    </div>
  </NuxtLink>
</template>
