<script setup lang="ts">
import { AtomicSwap } from '@injectivelabs/sdk-ts'

const props = defineProps({
  swap: {
    required: true,
    type: Object as PropType<AtomicSwap>
  }
})

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
  <div class="p-2 text-xs divide-y border-b border-brand-700">
    <div class="px-2 py-4 flex justify-between items-center">
      <p>{{ $t('trade.time') }}</p>
      <p>{{ time }}</p>
    </div>

    <div
      v-if="sourceTokenWithBalance"
      class="px-2 py-4 flex justify-between items-center"
    >
      <p>{{ $t('trade.swap.outgoing') }}</p>

      <div class="space-x-2 flex items-center">
        <CommonTokenIcon
          v-if="sourceTokenWithBalance.token && sourceTokenWithBalance.token"
          v-bind="{ token: sourceTokenWithBalance.token }"
        />

        <div>
          {{ sourceBalanceFormatted }}
          {{ sourceTokenWithBalance.token.symbol }}
        </div>
      </div>
    </div>

    <div
      v-if="destinationTokenWithBalance"
      class="flex items-center px-2 py-4 justify-between"
    >
      <p>{{ $t('trade.swap.incoming') }}</p>

      <div class="flex items-center space-x-2">
        <CommonTokenIcon
          v-if="destinationTokenWithBalance.token"
          v-bind="{ token: destinationTokenWithBalance.token }"
        />

        <div>
          {{ destinationBalanceFormatted }}
          {{ destinationTokenWithBalance.token.symbol }}
        </div>
      </div>
    </div>

    <div class="px-2 py-4 flex items-center justify-between">
      <p>{{ $t('trade.swap.route') }}</p>

      <div class="flex items-center space-x-1">
        <PartialsSwapRoute v-bind="{ isSm: true, routeSymbols }" />
      </div>
    </div>

    <div class="px-2 py-4 flex items-center justify-between">
      <p>{{ $t('trade.fee') }}</p>

      <div>
        <div v-for="(fee, index) in formattedFees" :key="`${fee}-${index}`">
          {{ fee }}
        </div>
      </div>
    </div>

    <div class="px-2 pt-4 pb-2 items-center">
      <NuxtLink
        class="w-full flex items-center justify-center space-x-2 hover:text-blue-500 hover:underline"
        :to="explorerLink"
        target="_blank"
      >
        <p>{{ $t('trade.swap.viewTransaction') }}</p>
        <SharedIcon is-md name="external-link" />
      </NuxtLink>
    </div>
  </div>
</template>
