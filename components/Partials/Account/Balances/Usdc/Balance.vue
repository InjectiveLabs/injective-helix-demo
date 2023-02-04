<script lang="ts" setup>
import { PropType } from 'vue'
import { BigNumberInBase } from '@injectivelabs/utils'
import { UiSubaccountBalance } from '@injectivelabs/sdk-ui-ts'
import { AccountBalance } from '@/types'
import { usdcTokenDenom, usdcTokenDenoms } from '@/app/data/token'

const accountStore = useAccountStore()
const bankStore = useBankStore()

const props = defineProps({
  hideBalances: Boolean,

  balance: {
    type: Object as PropType<AccountBalance>,
    required: true
  },

  balances: {
    type: Object as PropType<AccountBalance[]>,
    required: true
  }
})

const showUSDCBalances = ref(true)

const usdcBalances = computed(() =>
  props.balances.filter((balance) => {
    return usdcTokenDenoms.includes(balance.token.denom.toLowerCase())
  })
)

const hasUSDCPeggyBalance = computed(() => {
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

const filteredUSDCBalances = computed(() =>
  usdcBalances.value.filter(
    (balance) =>
      ![usdcTokenDenom.USDC].includes(balance.token.denom.toLowerCase()) ||
      hasUSDCPeggyBalance.value
  )
)

function toggleUSDCBalances() {
  showUSDCBalances.value = !showUSDCBalances.value
}
</script>

<template>
  <tbody>
    <PartialsAccountBalancesTableRow
      v-if="usdcBalances.length > 1"
      class="cursor-pointer border-b-transparent"
      v-bind="{ balance, hideBalances, expand: showUSDCBalances }"
      @click="toggleUSDCBalances"
    />

    <template v-if="showUSDCBalances">
      <PartialsAccountBalancesTableRow
        v-for="(usdcBalance, index) in filteredUSDCBalances"
        :key="usdcBalance.token.denom"
        :class="{
          'border-b-transparent': index < filteredUSDCBalances.length - 1
        }"
        v-bind="{
          hideBalances,
          balance: usdcBalance,
          hasOneUsdcBalance: usdcBalances.length === 1
        }"
      />
    </template>
  </tbody>
</template>
