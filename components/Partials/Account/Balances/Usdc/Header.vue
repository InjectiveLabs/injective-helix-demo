<script lang="ts" setup>
import { PropType } from 'vue'
import { Status, StatusType } from '@injectivelabs/utils'
import { AccountBalance } from '@/types'

defineProps({
  hideBalances: Boolean,
  showUsdcBalances: Boolean,

  aggregatedBalance: {
    type: Object as PropType<AccountBalance>,
    required: true
  },

  usdPriceStatus: {
    type: Object as PropType<Status>,
    default: new Status(StatusType.Loading)
  }
})

const emit = defineEmits<{
  (e: 'drawer:toggle'): void
}>()

function handleDrawerToggle() {
  emit('drawer:toggle')
}
</script>

<template>
  <PartialsAccountBalancesRowWrapper
    v-bind="{
      hideBalances,
      usdPriceStatus,
      hideActions: true,
      balance: aggregatedBalance
    }"
    :class="{
      'max-h-20': !showUsdcBalances,
      'max-h-screen': showUsdcBalances
    }"
  >
    <template #tokenSymbol>
      <PartialsAccountBalancesRowTokenSymbol
        v-bind="{ balance: aggregatedBalance }"
        @click="handleDrawerToggle"
      >
        <template #symbolSuffix>
          <BaseIcon
            name="caret-down"
            class="h-6 w-6 transition duration-300 hover:text-blue-500 transform"
            :class="{
              'rotate-180': showUsdcBalances
            }"
          />
        </template>
      </PartialsAccountBalancesRowTokenSymbol>
    </template>
  </PartialsAccountBalancesRowWrapper>
</template>
