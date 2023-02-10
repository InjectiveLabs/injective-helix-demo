<script lang="ts" setup>
import { PropType } from 'vue'
import { BigNumberInBase, BigNumberInWei } from '@injectivelabs/utils'
import { BalanceWithToken } from '@injectivelabs/sdk-ui-ts'

const props = defineProps({
  showBalance: Boolean,

  close: {
    type: Function,
    required: true
  },

  balances: {
    type: Array as PropType<BalanceWithToken[]>,
    default: () => []
  },

  modelValue: {
    type: String,
    default: ''
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

function handleClick(denom: string) {
  emit('update:modelValue', denom)

  props.close()
}
</script>

<template>
  <div class="max-h-xs px-4 pt-4 pb-4">
    <div class="mb-2 text-white">
      <AppInput v-model="search" sm :placeholder="$t('common.search')" />
    </div>

    <AppSelectTokenItem
      v-for="balance in sortedBalancesWithBalancesToBase"
      v-bind="{
        sm: true,
        token: balance.token,
        balance: balance.balance,
        showBalance: true
      }"
      :key="balance.denom"
      class="px-2 py-3 hover:bg-blue-500 cursor-pointer rounded text-white hover:text-black"
      @click="handleClick"
    />
  </div>
</template>
