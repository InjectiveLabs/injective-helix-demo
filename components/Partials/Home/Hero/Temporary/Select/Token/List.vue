<script lang="ts" setup>
import { BigNumberInBase, BigNumberInWei } from '@injectivelabs/utils'
import { BalanceWithToken } from '@injectivelabs/sdk-ui-ts'

const props = defineProps({
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

const sortedBalances = computed(() =>
  filteredOptions.value.sort((b1: BalanceWithToken, b2: BalanceWithToken) =>
    new BigNumberInBase(b2.balance).minus(b1.balance).toNumber()
  )
)

const sortedBalancesWithBalancesToBase = computed(() =>
  sortedBalances.value.map((balance) => {
    return {
      ...balance,
      balance: new BigNumberInWei(balance.balance)
        .toBase(balance.token.decimals)
        .toFixed()
    }
  })
)

function click(denom: string) {
  emit('update:modelValue', denom)

  emit('close')
}
</script>

<template>
  <div class="max-h-xs px-4 pt-4 pb-4">
    <div class="mb-2 text-white">
      <AppInput v-model="search" is-sm :placeholder="$t('common.search')" />
    </div>

    <PartialsHomeHeroTemporarySelectTokenItem
      v-for="balance in sortedBalancesWithBalancesToBase"
      v-bind="{
        isSm: true,
        isLgTokenIcon: true,
        isTokenNameVisible: true,
        token: balance.token,
        balance: balance.balance,
        isBalanceVisible: true
      }"
      :key="balance.denom"
      class="px-2 py-3 hover:bg-gray-300 cursor-pointer rounded"
      @click="click"
    />
  </div>
</template>
