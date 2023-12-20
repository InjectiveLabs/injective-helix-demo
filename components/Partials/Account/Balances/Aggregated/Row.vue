<script lang="ts" setup>
import { Status, StatusType } from '@injectivelabs/utils'
import { AccountBalance } from '@/types'

defineProps({
  isHideBalances: Boolean,
  isHoldingSingleUsdcDenom: Boolean,

  balance: {
    type: Object as PropType<AccountBalance>,
    required: true
  },

  usdPriceStatus: {
    type: Object as PropType<Status>,
    default: new Status(StatusType.Loading)
  }
})
</script>

<template>
  <PartialsAccountBalancesRowWrapper
    v-bind="{
      balance,
      isHideBalances,
      usdPriceStatus
    }"
  >
    <template #tokenSymbol>
      <PartialsAccountBalancesRowTokenSymbol v-bind="{ balance }">
        <template v-if="!isHoldingSingleUsdcDenom" #token>
          <div class="pl-6"></div>
        </template>

        <template #symbolSuffix>
          <PartialsAccountBalancesAggregatedLabel
            v-bind="{
              balance
            }"
          />
        </template>
      </PartialsAccountBalancesRowTokenSymbol>
    </template>
  </PartialsAccountBalancesRowWrapper>
</template>
