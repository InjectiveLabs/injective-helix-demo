<script lang="ts" setup>
import { BankBalanceWithToken } from '@injectivelabs/sdk-ui-ts'
import { PropType } from 'vue'
import { ActivityTab, UiMarketWithToken } from '@/types'

const spotStore = useSpotStore()
const derivativeStore = useDerivativeStore()

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },

  tab: {
    type: String as PropType<ActivityTab>,
    required: true
  }
})

const emit = defineEmits<{
  (e: 'update:modelValue', state: string): void
}>()

const markets = computed<UiMarketWithToken[]>(() =>
  props.tab === ActivityTab.Spot ? spotStore.markets : derivativeStore.markets
)

const tokens = computed(() => {
  if (!markets.value) {
    return []
  }

  // TODO: In TokenSelector V2 refactor this to also accept array of tokens.
  const tokens = markets.value.reduce((tokens, market) => {
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

    return [...tokens, baseToken, quoteToken]
  }, [] as BankBalanceWithToken[])

  const uniqueTokens = [
    ...new Map(tokens.map((token) => [token.denom, token])).values()
  ]

  return uniqueTokens
})

const options = computed(() =>
  tokens.value.map(({ token }) => ({
    token,
    display: token.symbol,
    value: token.denom
  }))
)

const value = computed({
  get: (): string => props.modelValue,
  set: (val: string) => {
    emit('update:modelValue', val)
  }
})
</script>

<template>
  <AppSelectField
    v-model="value"
    :options="options"
    :placeholder="
      tab === ActivityTab.WalletHistory
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
