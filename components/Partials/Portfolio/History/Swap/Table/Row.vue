<script setup lang="ts">
import { AtomicSwap } from '@injectivelabs/sdk-ts'
import { NuxtUiIcons } from '@shared/types'

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
  sourceBalanceFormattedToFixed,
  destinationTokenWithBalance,
  destinationBalanceFormattedToFixed
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
        <AppAmount
          v-bind="{
            amount: sourceBalanceFormattedToFixed
          }"
        />
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
        <AppAmount
          v-bind="{
            amount: destinationBalanceFormattedToFixed
          }"
        />
        {{ destinationTokenWithBalance.token.symbol }}
      </div>
    </div>

    <div class="p-2 flex items-center space-x-1 flex-1">
      <PartialsSwapRoute v-bind="{ isSm: true, routeSymbols }" />
    </div>

    <div class="p-2 flex items-center flex-1 gap-1">
      <div
        v-for="({ amount, symbol }, index) in formattedFees"
        :key="`${amount}-${symbol}-${index}`"
      >
        <AppAmount v-bind="{ amount }" />
        <span class="ml-1">{{ symbol }}</span>
      </div>
    </div>

    <div class="p-2 flex items-center w-10">
      <NuxtLink class="w-full text-white" :to="explorerLink" target="_blank">
        <div class="flex items-center justify-center">
          <UIcon :name="NuxtUiIcons.ExternalLink" class="h-4 w-4 min-w-4" />
        </div>
      </NuxtLink>
    </div>
  </div>
</template>
