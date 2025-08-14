<script lang="ts" setup>
import { BigNumber } from '@injectivelabs/utils'
import type { BigNumberInBase } from '@injectivelabs/utils'

const { lg } = useSharedBreakpoints()

withDefaults(
  defineProps<{
    stakedAmountInUsd: BigNumberInBase
    neptuneBalanceInBigNumber: BigNumberInBase
    aggregatedSubaccountTotalTradable: BigNumberInBase
    aggregatedSubaccountTotalBalanceInUsd: BigNumberInBase
    aggregatedSubaccountUnrealizedPnlInUsd: BigNumberInBase
  }>(),
  {}
)
</script>

<template>
  <UPopover
    :mode="lg ? 'hover' : 'click'"
    :popper="{ placement: 'bottom-start', offsetDistance: 0 }"
  >
    <div class="flex items-center gap-1 mb-0.5">
      <p class="text-coolGray-400 text-sm">
        {{ $t(`portfolio.home.balance.title`) }}:
      </p>

      <div class="flex items-center">
        <span class="text-sm">$</span>
        <CommonSkeletonSubaccountAmount>
          <CommonNumberCounter
            v-bind="{
              size: 14,
              value: aggregatedSubaccountTotalBalanceInUsd.toNumber() || 0
            }"
          />
        </CommonSkeletonSubaccountAmount>
      </div>
    </div>

    <template #panel>
      <div
        class="p-2 rounded bg-brand-800 flex flex-col gap-1 text-xs tracking-wide"
      >
        <span class="flex items-center gap-1">
          <p>{{ $t('portfolio.home.tradableBalance.title') }}:</p>
          <p class="flex">
            <SharedAmountUsd
              v-bind="{
                roundingMode: BigNumber.ROUND_HALF_UP,
                amount: aggregatedSubaccountTotalTradable.toFixed()
              }"
            >
              <template #prefix>$</template>
            </SharedAmountUsd>
          </p>
        </span>

        <span class="flex items-center gap-1">
          <p>{{ $t('portfolio.home.stakedInj') }}:</p>
          <p class="flex">
            <SharedAmountUsd
              v-bind="{
                amount: stakedAmountInUsd.toFixed(),
                roundingMode: BigNumber.ROUND_HALF_UP
              }"
            >
              <template #prefix>$</template>
            </SharedAmountUsd>
          </p>
        </span>

        <span class="flex items-center gap-1">
          <p>{{ $t('portfolio.home.yieldBearingUsdt') }}:</p>
          <p class="flex">
            <SharedAmountUsd
              v-bind="{
                roundingMode: BigNumber.ROUND_HALF_UP,
                amount: neptuneBalanceInBigNumber.toFixed()
              }"
            >
              <template #prefix>$</template>
            </SharedAmountUsd>
          </p>
        </span>

        <span class="flex items-center gap-1">
          <p>{{ $t('portfolio.home.unrealizedPositions') }}:</p>
          <p class="flex">
            <SharedAmountUsd
              v-bind="{
                roundingMode: BigNumber.ROUND_HALF_UP,
                amount: aggregatedSubaccountUnrealizedPnlInUsd.toFixed()
              }"
            >
              <template #prefix>$</template>
            </SharedAmountUsd>
          </p>
        </span>
      </div>
    </template>
  </UPopover>
</template>
