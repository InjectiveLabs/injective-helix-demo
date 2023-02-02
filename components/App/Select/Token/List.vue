<script lang="ts" setup>
import { PropType } from 'vue'
import { BigNumberInBase } from '@injectivelabs/utils'
import { BalanceWithToken } from '@/types'

const props = defineProps({
  showBalance: Boolean,

  modelValue: {
    type: String,
    default: ''
  },

  balances: {
    type: Array as PropType<BalanceWithToken[]>,
    default: () => []
  },

  close: {
    type: Function,
    required: true
  }
})

const search = ref('')

const emit = defineEmits<{
  (e: 'update:modelValue', state: string): void
}>()

const filteredOptions = computed(() => {
  return props.balances.filter((balance) => {
    const formattedSearch = search.value.trim().toLowerCase()

    if (!formattedSearch) {
      return true
    }

    return balance.token.symbol.toLowerCase().startsWith(formattedSearch)
  })
})

const sortedBalances = computed(() => {
  if (!props.showBalance) {
    return filteredOptions.value
  }

  return filteredOptions.value.sort(
    (b1: BalanceWithToken, b2: BalanceWithToken) =>
      new BigNumberInBase(b2.balanceToBase).minus(b1.balanceToBase).toNumber()
  )
})

function handleClick(denom: string) {
  emit('update:modelValue', denom)
  props.close()
}
</script>

<template>
  <div class="max-h-xs px-4 pt-4">
    <div class="mb-2 text-white">
      <AppInput v-model="search" sm :placeholder="$t('common.search')" />
    </div>

    <AppSelectTokenItem
      v-for="balance in sortedBalances"
      :key="balance.denom"
      class="px-2 py-3 hover:bg-blue-300 cursor-pointer rounded text-white hover:text-black"
      sm
      show-balance
      :token="balance.token"
      :balance="balance.balanceToBase"
      @click="handleClick"
    />
  </div>
</template>
