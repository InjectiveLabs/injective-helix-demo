<script setup lang="ts">
import { AtomicSwap } from '@injectivelabs/sdk-ts'

const props = withDefaults(
  defineProps<{
    swap: AtomicSwap
  }>(),
  {}
)

const {
  time,
  explorerLink,
  routeSymbols,
  formattedFees,
  sourceTokenWithBalance,
  sourceBalanceFormatted,
  destinationTokenWithBalance,
  destinationBalanceFormatted
} = useSwapHistory(computed(() => props.swap))
</script>

<template>
  <div class="flex p-2 text-xs">
    <div class="p-2 flex items-center flex-1">
      {{ time }}
    </div>

    <div
      v-if="sourceTokenWithBalance"
      class="p-2 flex items-center space-x-2 flex-1"
    >
      <CommonTokenIcon
        v-if="sourceTokenWithBalance.token && sourceTokenWithBalance.token"
        v-bind="{ token: sourceTokenWithBalance.token }"
      />

      <div>
        {{ sourceBalanceFormatted }}
        {{ sourceTokenWithBalance.token.symbol }}
      </div>
    </div>

    <div
      v-if="destinationTokenWithBalance"
      class="flex items-center p-2 space-x-2 flex-1"
    >
      <CommonTokenIcon
        v-if="destinationTokenWithBalance.token"
        v-bind="{ token: destinationTokenWithBalance.token }"
      />

      <div>
        {{ destinationBalanceFormatted }}
        {{ destinationTokenWithBalance.token.symbol }}
      </div>
    </div>

    <div class="p-2 flex items-center space-x-1 flex-1">
      <PartialsSwapRoute v-bind="{ isSm: true, routeSymbols }" />
    </div>

    <div class="p-2 flex items-center flex-1 gap-1">
      <div v-for="(fee, index) in formattedFees" :key="`${fee}-${index}`">
        {{ fee }}
      </div>
    </div>

    <div class="p-2 flex items-center w-10">
      <NuxtLink class="w-full text-white" :to="explorerLink" target="_blank">
        <div class="flex items-center justify-center">
          <SharedIcon is-md name="external-link" />
        </div>
      </NuxtLink>
    </div>
  </div>
</template>
