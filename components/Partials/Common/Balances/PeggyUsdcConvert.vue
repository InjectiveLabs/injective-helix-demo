<script lang="ts" setup>
import { PropType } from 'vue'
import { BigNumberInBase } from '@injectivelabs/utils'
import { Modal, UiMarketWithToken } from '@/types'
import { usdcTokenDenom } from '@/app/data/token'

const modalStore = useModalStore()

const { accountBalancesWithToken } = useBalance()

const props = defineProps({
  market: {
    type: Object as PropType<UiMarketWithToken>,
    required: true
  }
})

const hasUsdcPeggyBalance = computed(() => {
  if (usdcTokenDenom.USDCet !== props.market.quoteDenom) {
    return false
  }

  const peggyUsdcBalance = accountBalancesWithToken.value.find(
    (accountBalance) => {
      return accountBalance.denom === usdcTokenDenom.USDC
    }
  )

  return new BigNumberInBase(peggyUsdcBalance?.availableMargin || 0).gt(0)
})

onMounted(() => {
  nextTick(() => {
    if (hasUsdcPeggyBalance.value) {
      openModal()
    }
  })
})

function openModal() {
  modalStore.openModal({ type: Modal.USDCDetected })
}
</script>

<template>
  <div v-if="hasUsdcPeggyBalance" class="cursor-pointer" @click="openModal">
    <span class="text-blue-500 font-semibold">{{
      $t('trade.swap.convert')
    }}</span>
  </div>

  <ModalsPeggyUsdcDetected :market="market" />
</template>
