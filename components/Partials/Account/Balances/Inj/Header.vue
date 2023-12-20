<script lang="ts" setup>
import { Status, StatusType } from '@injectivelabs/utils'
import { AccountBalance } from '@/types'

defineProps({
  isShowStaked: Boolean,
  isHideBalances: Boolean,

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
      balance
    }"
  >
    <template #tokenSymbol>
      <PartialsAccountBalancesRowTokenSymbol
        v-bind="{ balance }"
        @click="toggleDrawer"
      >
        <template #symbolSuffix>
          <BaseIcon
            name="caret-down"
            class="h-6 w-6 transition duration-300 hover:text-blue-500"
            :class="{
              'rotate-180': isShowStaked
            }"
          />
        </template>
      </PartialsAccountBalancesRowTokenSymbol>
    </template>
  </PartialsAccountBalancesRowWrapper>
</template>
