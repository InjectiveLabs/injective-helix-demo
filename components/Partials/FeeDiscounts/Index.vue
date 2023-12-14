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
                {{ $t('feeDiscounts.staked_amount') }}
              </span>
              <AppTooltip
                class="ml-2"
                :content="$t('feeDiscounts.staked_amount_tooltip')"
              />
            </div>
          </th>
          <th class="text-center w-32"></th>
          <th class="text-right">
            <div class="flex items-center justify-end">
              <span>
                {{ $t('feeDiscounts.trading_volume') }}
              </span>
              <AppTooltip
                class="ml-2"
                :content="$t('feeDiscounts.trading_volume_tooltip')"
              />
            </div>
          </th>
          <th class="text-right">
            <div class="flex items-center justify-end">
              <span>
                {{ $t('feeDiscounts.maker_rate_discount') }}
              </span>
              <AppTooltip
                class="ml-2"
                :content="$t('feeDiscounts.maker_rate_discount_tooltip')"
              />
            </div>
          </th>
          <th class="text-right">
            <div class="flex items-center justify-end">
              <span>
                {{ $t('feeDiscounts.taker_rate_discount') }}
              </span>
              <AppTooltip
                class="ml-2"
                :content="$t('feeDiscounts.taker_rate_discount_tooltip')"
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
