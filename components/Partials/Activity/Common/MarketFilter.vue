<script lang="ts" setup>
import type { Token } from '@injectivelabs/token-metadata'
import { PropType } from 'vue'
import { ActivityTab } from '@/types'

const route = useRoute()

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },

  tokens: {
    type: Array as PropType<Token[]>,
    required: true
  }
})

const emit = defineEmits<{
  (e: 'update:modelValue', state: string): void
}>()

const options = computed(() =>
  props.tokens.map((token) => ({
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
      route.name?.toString().startsWith(ActivityTab.WalletHistory)
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
