<script lang="ts" setup>
import { BankBalanceWithToken } from '@injectivelabs/sdk-ui-ts'
import { PropType } from 'vue'
import { ActivityView, UiMarketWithToken } from '@/types'

const props = defineProps({
  markets: {
    type: Array as PropType<UiMarketWithToken[]>,
    default: undefined
  },

  modelValue: {
    type: String,
    default: ''
  },

  view: {
    type: String,
    required: true
  }
})

const emit = defineEmits<{
  (e: 'update:modelValue', state: string): void
}>()

const isWalletView = computed(() => {
  return (
    props.view === ActivityView.WalletDeposits ||
    props.view === ActivityView.WalletTransfers ||
    props.view === ActivityView.WalletWithdrawals
  )
})

const tokens = computed(() => {
  if (!props.markets) {
    return []
  }

  // TODO: In TokenSelector V2 refactor this to also accept array of tokens.
  const tokens = props.markets.reduce((list, market) => {
    const baseToken = {
      balance: '',
      denom: market.baseToken.denom,
      token: market.baseToken
    } as BankBalanceWithToken

    const quoteToken = {
      balance: '',
      denom: market.quoteToken.denom,
      token: market.quoteToken
    } as BankBalanceWithToken

    return [...list, baseToken, quoteToken]
  }, [] as BankBalanceWithToken[])

  const uniqueTokens = [
    ...new Map(tokens.map((token) => [token.denom, token])).values()
  ]

  return uniqueTokens
})

const options = computed(() => {
  return tokens.value.map(({ token }) => ({
    token,
    display: token.symbol,
    value: token.denom
  }))
})

const value = computed({
  get(): string {
    return props.modelValue
  },
  set(val: string) {
    emit('update:modelValue', val)
  }
})
</script>

<template>
  <AppSelectField
    v-model="value"
    :options="options"
    :placeholder="
      isWalletView
        ? $t('walletHistory.transfers.asset')
        : $t('account.positions.market.label')
    "
    searchable
    clearable
    data-cy="universal-table-filter-by-asset-input"
  >
    <template #selected-option="{ option }">
      <PartialsAccountPositionsFilterOption v-if="option" :option="option" />
    </template>

    <template #option="{ option, active }">
      <PartialsAccountPositionsFilterOption :option="option" :active="active" />
    </template>
  </AppSelectField>
</template>
