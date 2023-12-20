<script lang="ts" setup>
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
  <tr v-if="swap" :data-cy="'swap-history-table-row-' + swap.txHash">
    <td class="h-12 text-left pl-3">
      <span class="text-white text-xs" data-cy="trade-entry-time">
        {{ time }}
      </span>
    </td>

    <td class="h-12 text-left cursor-pointer">
      <div class="flex items-center">
        <div>
          <CommonTokenIcon
            v-if="
              sourceTokenWithBalance?.token && sourceTokenWithBalance?.token
            "
            :token="sourceTokenWithBalance.token"
            is-md
          />
        </div>
        <div class="ml-3">
          <span
            class="text-gray-200 text-xs"
            data-cy="swap-history-ticker-name-table-data"
          >
            {{ sourceBalanceFormatted }}
            {{ sourceTokenWithBalance?.token.symbol }}
          </span>
        </div>
      </div>
    </td>

    <td class="h-12 text-left cursor-pointer">
      <div class="flex items-center">
        <div>
          <CommonTokenIcon
            v-if="
              destinationTokenWithBalance?.token &&
              destinationTokenWithBalance?.token
            "
            :token="destinationTokenWithBalance?.token"
            is-md
          />
        </div>
        <div class="ml-3">
          <span
            class="text-gray-200 text-xs"
            data-cy="swap-history-ticker-name-table-data"
          >
            {{ destinationBalanceFormatted }}

            {{ destinationTokenWithBalance?.token.symbol }}
          </span>
        </div>
      </div>
    </td>

    <td>
      <div class="flex items-center gap-1 justify-start text-xs">
        <PartialsSwapRoute v-bind="{ isSm: true, routeSymbols }" />
      </div>
    </td>

    <td class="h-12 text-right">
      <div class="flex flex-col items-start text-xs">
        <div v-for="(fee, index) in formattedFees" :key="`${fee}-${index}`">
          {{ fee }}
        </div>
      </div>
    </td>

    <td class="h-12 text-right pr-3 text-xs">
      <NuxtLink class="w-full text-white" :to="explorerLink" target="_blank">
        <div class="flex items-center justify-center">
          <BaseIcon name="external-link" class="w-3 h-3" />
        </div>
      </NuxtLink>
    </td>
  </tr>
</template>
