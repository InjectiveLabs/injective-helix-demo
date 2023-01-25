<script lang="ts" setup>
import { PropType } from 'vue'
import { AccountBalance, USDCSymbol } from '@/types'

const props = defineProps({
  balance: {
    type: Object as PropType<AccountBalance>,
    required: true
  },

  balances: {
    type: Object as PropType<AccountBalance[]>,
    required: true
  },

  hideBalances: {
    type: Boolean,
    required: true
  }
})

const showUSDCBalances = ref(true)

const usdcBalances = computed(() =>
  props.balances.filter((balance) => {
    return [
      USDCSymbol.PeggyEthereum,
      USDCSymbol.WormholeEthereum,
      USDCSymbol.WormholeSolana
    ].includes(balance.token.symbol as USDCSymbol)
  })
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
        v-for="(usdcBalance, index) in usdcBalances"
        :key="usdcBalance.token.denom"
        :class="{
          'border-b-transparent': index < usdcBalances.length - 1
        }"
        v-bind="{ hideBalances, balance: usdcBalance }"
      />
    </template>
  </tbody>
</template>
