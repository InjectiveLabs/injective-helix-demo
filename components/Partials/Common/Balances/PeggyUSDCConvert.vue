<script lang="ts" setup>
import { PropType } from 'vue'
import { UiSubaccountBalance } from '@injectivelabs/sdk-ui-ts'
import { BigNumberInBase } from '@injectivelabs/utils'
import { Modal, UiMarketWithToken } from '@/types'
import { usdcTokenDenom } from '@/app/data/token'

const accountStore = useAccountStore()
const bankStore = useBankStore()
const modalStore = useModalStore()

const props = defineProps({
  market: {
    type: Object as PropType<UiMarketWithToken>,
    required: true
  }
})

const hasUSDCPeggyBalance = computed(() => {
  if (
    ![usdcTokenDenom.USDCet].includes(
      props.market.quoteToken.denom.toLowerCase()
    )
  ) {
    return false
  }

  const peggyUSDCBankBalance =
    bankStore.bankBalancesWithToken.find((balance) =>
      [usdcTokenDenom.USDC].includes(balance.token.denom.toLowerCase())
    )?.balance || '0'

  if (!accountStore.subaccount || !accountStore.subaccount.balances) {
    return new BigNumberInBase(peggyUSDCBankBalance).gt(0)
  }

  const peggyUSDCSubaccountBalance =
    accountStore.subaccount.balances.find((balance: UiSubaccountBalance) =>
      [usdcTokenDenom.USDC].includes(balance.denom.toLowerCase())
    )?.totalBalance || '0'

  return (
    new BigNumberInBase(peggyUSDCBankBalance).gt(0) ||
    new BigNumberInBase(peggyUSDCSubaccountBalance).gt(0)
  )
})

onMounted(() => {
  if (hasUSDCPeggyBalance.value) {
    openModal()
  }
})

function openModal() {
  modalStore.openModal({ type: Modal.USDCDetected })
}
</script>

<template>
  <div v-if="hasUSDCPeggyBalance" class="cursor-pointer" @click="openModal">
    <span class="text-blue-500 font-semibold">{{
      $t('trade.convert.convert')
    }}</span>
  </div>

  <ModalsPeggyUSDCDetected :market="market" />
</template>
