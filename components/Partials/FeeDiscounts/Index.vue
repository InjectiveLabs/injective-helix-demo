<script lang="ts" setup>
const exchangeStore = useExchangeStore()

const tierLevelsWithZeroTierLevel = computed(() =>
  exchangeStore.feeDiscountSchedule
    ? [
        {
          volume: '0',
          stakedAmount: '0',
          feePaidAmount: '0',
          makerDiscountRate: '0',
          takerDiscountRate: '0'
        },
        ...exchangeStore.feeDiscountSchedule.tierInfosList
      ]
    : []
)
</script>

<template>
  <div class="table-responsive h-full">
    <table class="table">
      <thead>
        <tr>
          <th class="text-left">
            {{ $t('fee_discounts.tier') }}
          </th>
          <th class="text-right">
            <div class="flex items-end justify-end">
              <span>
                {{ $t('fee_discounts.staked_amount') }}
              </span>
              <CommonInfoTooltip
                class="ml-2"
                :tooltip="$t('fee_discounts.staked_amount_tooltip')"
              />
            </div>
          </th>
          <th class="text-center w-32"></th>
          <th class="text-right">
            <div class="flex items-end justify-end">
              <span>
                {{ $t('fee_discounts.trading_volume') }}
              </span>
              <CommonInfoTooltip
                class="ml-2"
                :tooltip="$t('fee_discounts.trading_volume_tooltip')"
              />
            </div>
          </th>
          <th class="text-right">
            <div class="flex items-end justify-end">
              <span>
                {{ $t('fee_discounts.maker_rate_discount') }}
              </span>
              <CommonInfoTooltip
                class="ml-2"
                :tooltip="$t('fee_discounts.maker_rate_discount_tooltip')"
              />
            </div>
          </th>
          <th class="text-right">
            <div class="flex items-end justify-end">
              <span>
                {{ $t('fee_discounts.taker_rate_discount') }}
              </span>
              <CommonInfoTooltip
                class="ml-2"
                :tooltip="$t('fee_discounts.taker_rate_discount_tooltip')"
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
