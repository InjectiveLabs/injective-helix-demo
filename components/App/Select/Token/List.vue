<script lang="ts" setup>
import { SharedBalanceWithToken } from '@shared/types'
import { BigNumberInBase, BigNumberInWei } from '@injectivelabs/utils'

const props = defineProps({
  isBalanceVisible: Boolean,

  balances: {
    type: Array as PropType<SharedBalanceWithToken[]>,
    default: () => []
  },

  modelValue: {
    type: String,
    default: ''
  }
})

const search = ref('')

const emit = defineEmits<{
  'update:modelValue': [state: string]
  close: []
}>()

const filteredOptions = computed(() => {
  return props.balances.filter((balance) => {
    const formattedSearch = search.value.trim().toLowerCase()

    if (!formattedSearch) {
      return true
    }

    const { name } = balance.token
    const shouldIncludeSupply =
      name.toLowerCase().includes(formattedSearch) ||
      balance.token.denom.toLowerCase().includes(formattedSearch) ||
      balance.token.symbol.toLowerCase().includes(formattedSearch)

    return shouldIncludeSupply
  })
})

const sortedBalances = computed(() => {
  if (!props.isBalanceVisible) {
    return filteredOptions.value
  }

  return filteredOptions.value.sort(
    (b1: SharedBalanceWithToken, b2: SharedBalanceWithToken) =>
      new BigNumberInBase(b2.balance).minus(b1.balance).toNumber()
  )
})

const sortedBalancesWithBalancesToBase = computed(() => {
  return sortedBalances.value.map((balance) => {
    return {
      ...balance,
      balance: new BigNumberInWei(balance.balance)
        .toBase(balance.token.decimals)
        .toFixed()
    }
  })
})

function onClick(denom: string) {
  emit('update:modelValue', denom)
  emit('close')
}
</script>

<template>
  <div class="max-h-xs">
    <div class="mb-2 text-white">
      <AppInput v-model="search" is-sm :placeholder="$t('common.search')" />
    </div>

    <AppSelectTokenItem
      v-for="balance in sortedBalancesWithBalancesToBase"
      v-bind="{
        ...$attrs,
        isSm: true,
        isLgTokenIcon: true,
        token: balance.token,
        isBalanceVisible: true,
        isTokenNameVisible: true,
        balance: balance.balance
      }"
      :key="balance.denom"
      class="px-2 py-3 hover:bg-gray-700 cursor-pointer rounded text-white"
      @click="onClick"
    />
  </div>
</template>
