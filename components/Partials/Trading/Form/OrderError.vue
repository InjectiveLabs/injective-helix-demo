<script lang="ts" setup>
const bankStore = useBankStore()
const walletStore = useWalletStore()

defineProps({
  highDeviation: Boolean
})

const faucetUrl = 'https://inj.supply/'

const notEnoughInjForGas = computed(
  () => walletStore.isUserWalletConnected && !bankStore.hasEnoughInjForGas
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
    </div>
  </div>
</template>
