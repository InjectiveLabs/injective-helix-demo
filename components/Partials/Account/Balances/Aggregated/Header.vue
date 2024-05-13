<script lang="ts" setup>
import { Status, StatusType } from '@injectivelabs/utils'
import { AccountBalance } from '@/types'

defineProps({
  isHideBalances: Boolean,
  isUsdcBalancesVisible: Boolean,

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
  'drawer:toggle': []
}>()

function toggleDrawer() {
  emit('drawer:toggle')
}
</script>

<template>
  <PartialsAccountBalancesRowWrapper
    v-bind="{
      isHideBalances,
      usdPriceStatus,
      hideActions: true,
      balance: aggregatedBalance
    }"
    :class="{
      'max-h-20': !isUsdcBalancesVisible,
      'max-h-screen': isUsdcBalancesVisible
    }"
  >
    <template #tokenSymbol>
      <PartialsAccountBalancesRowTokenSymbol
        v-bind="{ balance: aggregatedBalance }"
        @click="toggleDrawer"
      >
        <template #symbolSuffix>
          <SharedIcon
            name="caret-down"
            class="h-6 w-6 transition duration-300 hover:text-blue-500 transform"
            :class="{
              'rotate-180': isUsdcBalancesVisible
            }"
          />
        </template>
      </PartialsAccountBalancesRowTokenSymbol>
    </template>
  </PartialsAccountBalancesRowWrapper>
</template>
