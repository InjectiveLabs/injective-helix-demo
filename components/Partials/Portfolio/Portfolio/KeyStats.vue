<script setup lang="ts">
import { BigNumberInBase } from '@injectivelabs/utils'

const appStore = useAppStore()
const accountStore = useAccountStore()
const {
  stakedAmountInUsd,
  aggregatedSubaccountTotalBalanceInUsd,
  aggregatedSubaccountUnrealizedPnlInUsd
} = useBalance()

const { valueToBigNumber: spotEquityInBigNumber } = useSharedBigNumberFormatter(
  computed(() =>
    aggregatedSubaccountTotalBalanceInUsd.value.minus(
      aggregatedSubaccountUnrealizedPnlInUsd.value
    )
  )
)

const totalVolume = computed(
  () => new BigNumberInBase(accountStore.accountStats?.volume || 0)
)

const allTimePnl = computed(
  () => new BigNumberInBase(accountStore.accountStats?.pnl || 0)
)
</script>

<template>
  <div class="border rounded-xl p-4">
    <h4 class="font-semibold text-coolGray-200 text-sm">
      {{ $t('portfolio.keyStats.title') }}
    </h4>

    <ul class="flex flex-col gap-6 mt-6">
      <li class="flex justify-between gap-4 text-sm h-6">
        <span class="text-coolGray-375">
          {{ $t('portfolio.keyStats.allTimePnl') }}
        </span>

        <p
          class="flex"
          :class="[
            appStore.userState.preferences.isHideBalances
              ? 'text-gray-200'
              : allTimePnl.isZero()
                ? 'text-gray-200'
                : allTimePnl.gt(0)
                  ? 'text-green-500'
                  : 'text-red-500'
          ]"
        >
          <span class="mt-0.5 text-[13px]">$</span>
          <CommonSkeletonSubaccountAmount>
            <CommonNumberCounter
              v-bind="{
                size: 13,
                value: allTimePnl.toNumber()
              }"
            />
          </CommonSkeletonSubaccountAmount>
        </p>
      </li>

      <li class="flex justify-between gap-4 text-sm h-6">
        <span class="text-coolGray-375">
          {{ $t('portfolio.keyStats.totalVolume') }}
        </span>

        <p class="flex text-gray-200">
          <span class="mt-0.5 text-[13px]">$</span>
          <CommonSkeletonSubaccountAmount>
            <CommonNumberCounter
              v-bind="{
                size: 13,
                value: totalVolume.toNumber()
              }"
            />
          </CommonSkeletonSubaccountAmount>
        </p>
      </li>

      <li class="flex justify-between gap-4 text-sm h-6">
        <span class="text-coolGray-375">
          {{ $t('portfolio.keyStats.totalEquity') }}
        </span>

        <p class="flex text-gray-200">
          <span class="mt-0.5 text-[13px]">$</span>
          <CommonSkeletonSubaccountAmount>
            <CommonNumberCounter
              v-bind="{
                size: 13,
                value: aggregatedSubaccountTotalBalanceInUsd.toNumber()
              }"
            />
          </CommonSkeletonSubaccountAmount>
        </p>
      </li>

      <li class="flex justify-between gap-4 text-sm h-6">
        <span class="text-coolGray-375">
          {{ $t('portfolio.keyStats.perpsAccountEquity') }}
        </span>

        <p class="flex text-gray-200">
          <span class="mt-0.5 text-[13px]">$</span>
          <CommonSkeletonSubaccountAmount>
            <CommonNumberCounter
              v-bind="{
                size: 13,
                value: aggregatedSubaccountUnrealizedPnlInUsd.toNumber()
              }"
            />
          </CommonSkeletonSubaccountAmount>
        </p>
      </li>

      <li class="flex justify-between gap-4 text-sm h-6">
        <span class="text-coolGray-375">
          {{ $t('portfolio.keyStats.spotAccountEquity') }}
        </span>

        <p class="flex text-gray-200">
          <span class="mt-0.5 text-[13px]">$</span>
          <CommonSkeletonSubaccountAmount>
            <CommonNumberCounter
              v-bind="{
                size: 13,
                value: spotEquityInBigNumber.toNumber()
              }"
            />
          </CommonSkeletonSubaccountAmount>
        </p>
      </li>

      <li class="flex justify-between gap-4 text-sm h-6">
        <span class="text-coolGray-375">
          {{ $t('portfolio.keyStats.stakingAccount') }}
        </span>

        <p class="flex text-gray-200">
          <span class="mt-0.5 text-[13px]">$</span>
          <CommonSkeletonSubaccountAmount>
            <CommonNumberCounter
              v-bind="{
                size: 13,
                value: stakedAmountInUsd.toNumber()
              }"
            />
          </CommonSkeletonSubaccountAmount>
        </p>
      </li>
    </ul>
  </div>
</template>
