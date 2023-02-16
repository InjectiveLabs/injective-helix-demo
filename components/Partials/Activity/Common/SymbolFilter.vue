<script lang="ts" setup>
import { BalanceWithToken } from '@injectivelabs/sdk-ui-ts'
import { PropType } from 'vue'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },

  tokens: {
    type: Array as PropType<BalanceWithToken[]>,
    required: true
  }
})

const emit = defineEmits<{
  (e: 'update:modelValue', state: string): void
}>()

const options = computed(() =>
  props.tokens.map(({ token }) => ({
    token,
    display: token.symbol,
    value: token.symbol
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
    :placeholder="$t('walletHistory.transfers.asset')"
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
