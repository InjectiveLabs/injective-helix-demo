<script lang="ts" setup>
import { UI_DEFAULT_MAX_NUMBER_OF_ORDERS } from '@/app/utils/constants'

const accountStore = useAccountStore()
const walletStore = useWalletStore()

defineProps({
  maxOrdersError: Boolean,
  highDeviation: Boolean
})

const faucetUrl = 'https://inj.supply/'

const notEnoughInjForGas = computed(
  () => walletStore.isUserWalletConnected && !accountStore.hasEnoughInjForGas
)
</script>

<template>
  <div>
    <div>
      <p v-if="highDeviation" class="text-2xs text-red-200 mb-4">
        {{ $t('trade.execution_price_far_away_from_last_traded_price') }}
      </p>

      <p v-if="notEnoughInjForGas" class="text-2xs text-red-400 mb-4">
        {{ $t('insufficientGas.tradingFormNote') }}
        <a
          :href="faucetUrl"
          target="_blank"
          class="flex items-center text-blue-500"
        >
          <span class="mr-1">
            {{ $t('insufficientGas.getFreeInj') }}
          </span>
          <BaseIcon name="external-link" class="w-2 h-2" />
        </a>
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
