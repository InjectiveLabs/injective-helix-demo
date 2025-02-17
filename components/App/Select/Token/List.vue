<script lang="ts" setup>
import { SharedBalanceWithToken } from '@shared/types'
import { sharedToBalanceInToken } from '@shared/utils/formatter'

const props = withDefaults(
  defineProps<{
    isBalanceVisible?: boolean
    balances?: SharedBalanceWithToken[]
    modelValue?: string
  }>(),
  {
    isBalanceVisible: false,
    balances: () => [],
    modelValue: ''
  }
)

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
      name.toLowerCase().startsWith(formattedSearch) ||
      balance.token.denom.toLowerCase().startsWith(formattedSearch) ||
      balance.token.symbol.toLowerCase().startsWith(formattedSearch)

    return shouldIncludeSupply
  })
})

const sortedBalancesWithBalancesToBase = computed(() => {
  return filteredOptions.value.map((balance) => {
    return {
      ...balance,
      balance: sharedToBalanceInToken({
        value: balance.balance,
        decimalPlaces: balance.token.decimals
      })
    }
  })
})

function onClick(denom: string) {
  emit('update:modelValue', denom)
  emit('close')
}

onMounted(() => {
  document.getElementById('swap-token-search')?.focus()
})
</script>

<template>
  <div class="max-h-xs">
    <div class="mb-2 text-white">
      <AppInput
        id="swap-token-search"
        v-model="search"
        is-sm
        :placeholder="$t('common.search')"
      />
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
      class="px-2 py-3 hover:bg-coolGray-700 cursor-pointer rounded text-white"
      @click="onClick"
    />
  </div>
</template>
