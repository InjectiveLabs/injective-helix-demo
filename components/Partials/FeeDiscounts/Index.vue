<script lang="ts" setup>
const exchangeStore = useExchangeStore()

// Note: Keep in mind that on chain the #0 tier level is actually shown as  #1 on the UI
// check store/exchange.ts on the fetchFeeDiscountSchedule action
const tierLevelsWithZeroTierLevel = computed(
  () => exchangeStore.feeDiscountSchedule?.tierInfosList || []
)
</script>

<template>
  <div class="table-responsive h-full">
    <table class="table">
      <thead>
        <tr>
          <th class="text-left">
            {{ $t('feeDiscounts.tier') }}
          </th>
          <th class="text-right">
            <div class="flex items-center justify-end">
              <span>
                {{ $t('feeDiscounts.stakedAmount') }}
              </span>
              <AppTooltip
                class="ml-2"
                :content="$t('feeDiscounts.stakedAmountTooltip')"
              />
            </div>
          </th>
          <th class="text-center w-32"></th>
          <th class="text-right">
            <div class="flex items-center justify-end">
              <span>
                {{ $t('feeDiscounts.tradingVolume') }}
              </span>
              <AppTooltip
                class="ml-2"
                :content="$t('feeDiscounts.tradingVolumeTooltip')"
              />
            </div>
          </th>
          <th class="text-right">
            <div class="flex items-center justify-end">
              <span>
                {{ $t('feeDiscounts.makerRateDiscount') }}
              </span>
              <AppTooltip
                class="ml-2"
                :content="$t('feeDiscounts.makerRateDiscountTooltip')"
              />
            </div>
          </th>
          <th class="text-right">
            <div class="flex items-center justify-end">
              <span>
                {{ $t('feeDiscounts.takerRateDiscount') }}
              </span>
              <AppTooltip
                class="ml-2"
                :content="$t('feeDiscounts.takerRateDiscountTooltip')"
              />
            </div>
          </th>
        </tr>
      </thead>

      <tbody v-if="exchangeStore.feeDiscountSchedule">
        <PartialsFeeDiscountsTier
          v-for="(tier, index) in tierLevelsWithZeroTierLevel"
          :key="`tier-${index}`"
          :tier="tier"
          :index="index"
        />
      </tbody>
    </table>
  </div>
</template>
