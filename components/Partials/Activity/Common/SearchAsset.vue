<script lang="ts" setup>
import { BankBalanceWithTokenAndBalanceInBase } from '@injectivelabs/sdk-ui-ts'
import { PropType } from 'vue'
import { UiMarketWithToken } from '@/types'

const props = defineProps({
  markets: {
    type: Array as PropType<UiMarketWithToken[]>,
    default: undefined
  },

  modelValue: {
    type: String,
    default: ''
  }
})

const emit = defineEmits<{
  (e: 'update', state: string): void
}>()

const supportedTokens = computed(() => {
  if (!props.markets) {
    return []
  }

  // TODO: In TokenSelector V2 refactor this to also accept array of tokens.
  const tokens = props.markets.reduce((list, market) => {
    const baseToken = {
      balance: '',
      denom: market.baseToken.denom,
      token: market.baseToken
    } as BankBalanceWithTokenAndBalanceInBase

    const quoteToken = {
      balance: '',
      denom: market.quoteToken.denom,
      token: market.quoteToken
    } as BankBalanceWithTokenAndBalanceInBase

    return [...list, baseToken, quoteToken]
  }, [] as BankBalanceWithTokenAndBalanceInBase[])

  const uniqueTokens = [
    ...new Map(tokens.map((token) => [token.denom, token])).values()
  ]

  return uniqueTokens
})

const options = computed(() => {
  return supportedTokens.value.map(({ token }) => {
    return {
      display: token.symbol,
      value: token.denom
    }
  })
})

const value = computed({
  get(): string {
    return props.modelValue
  },
  set(val: string) {
    emit('update', val)
  }
})
</script>

<template>
  <AppSelectField
    v-model="value"
    :options="options"
    :placeholder="$t('account.positions.market.label')"
    searchable
    clearable
    data-cy="universal-table-filter-by-asset-input"
  >
    <template #selected-option="{ option }">
      <PartialsAccountPositionsFilterOption :option="option" />
    </template>

    <template #option="{ option, active }">
      <PartialsAccountPositionsFilterOption :option="option" :active="active" />
    </template>
  </AppSelectField>
</template>
