<script lang="ts" setup>
import { PropType } from 'vue'
import { Status, StatusType } from '@injectivelabs/utils'
import { AccountBalance } from '@/types'

defineProps({
  showStaked: Boolean,
  hideBalances: Boolean,

  balance: {
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
      balance
    }"
  >
    <template #tokenSymbol>
      <PartialsAccountBalancesRowTokenSymbol
        v-bind="{ balance }"
        @click="handleDrawerToggle"
      >
        <template #symbolSuffix>
          <BaseIcon
            name="caret-down"
            class="h-6 w-6 transition duration-300 hover:text-blue-500 transform"
            :class="{
              'rotate-180': showStaked
            }"
          />
        </template>
      </PartialsAccountBalancesRowTokenSymbol>
    </template>
  </PartialsAccountBalancesRowWrapper>
</template>
