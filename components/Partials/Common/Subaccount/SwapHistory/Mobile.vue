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
  sourceBalanceFormatted,
  sourceTokenWithBalance,
  destinationTokenWithBalance,
  destinationBalanceFormatted
} = useSwapHistory(computed(() => props.swap))
</script>

<template>
  <CommonTableRow is-dense>
    <div
      class="flex items-end justify-between col-span-2 text-xs leading-5 pb-1"
    >
      <NuxtLink class="w-full text-white" :to="explorerLink" target="_blank">
        <div class="flex items-center justify-end">
          <BaseIcon name="external-link" class="w-3 h-3" />
        </div>
      </NuxtLink>
    </div>

    <span class="text-gray-500 uppercase tracking-widest text-3xs">
      {{ $t('trade.swap.outgoing') }}
    </span>
    <div class="text-right flex justify-end gap-1">
      <span>
        <CommonTokenIcon
          v-if="sourceTokenWithBalance?.token && sourceTokenWithBalance?.token"
          :token="sourceTokenWithBalance?.token"
          is-sm
        />
      </span>

      <span
        class="text-gray-200 text-xs"
        data-cy="swap-history-ticker-name-table-data"
      >
        {{
          `${sourceBalanceFormatted} ${sourceTokenWithBalance?.token.symbol}`
        }}
      </span>
    </div>

    <span class="text-gray-500 uppercase tracking-widest text-3xs">
      {{ $t('trade.swap.incoming') }}
    </span>
    <div class="text-right flex justify-end gap-1">
      <span>
        <CommonTokenIcon
          v-if="
            destinationTokenWithBalance?.token &&
            destinationTokenWithBalance?.token
          "
          :token="destinationTokenWithBalance?.token"
          is-sm
        />
      </span>

      <span
        class="text-gray-200 text-xs"
        data-cy="swap-history-ticker-name-table-data"
      >
        {{
          `${destinationBalanceFormatted} ${destinationTokenWithBalance?.token.symbol}`
        }}
      </span>
    </div>

    <span class="text-gray-500 uppercase tracking-widest text-3xs">
      {{ $t('trade.time') }}
    </span>
    <span class="text-right text-xs font-mono tracking-wide">
      {{ time }}
    </span>
  </CommonTableRow>
</template>
