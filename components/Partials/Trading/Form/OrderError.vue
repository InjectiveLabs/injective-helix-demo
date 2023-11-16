<script lang="ts" setup>
import { UI_DEFAULT_MAX_NUMBER_OF_ORDERS } from '@/app/utils/constants'

defineProps({
  highDeviation: Boolean,
  maxOrdersError: Boolean
})
</script>

<template>
  <div>
    <div>
      <p v-if="highDeviation" class="text-2xs text-red-200 mb-4">
        {{ $t('trade.execution_price_far_away_from_last_traded_price') }}
      </p>

      <p v-if="maxOrdersError" class="text-2xs text-red-200 mb-4">
        {{
          $t('trade.you_can_only_have_max_orders', {
            number: UI_DEFAULT_MAX_NUMBER_OF_ORDERS
          })
        }}
      </p>
    </div>
  </div>
</template>
