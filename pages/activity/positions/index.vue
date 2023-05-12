<script setup lang="ts">
import { Token } from '@injectivelabs/token-metadata'
import {
  ActivityTab,
  ActivityForm,
  ActivityField,
  UiMarketWithToken
} from '@/types'
import { getDenomsFromToken } from '@/app/data/token'

const route = useRoute()
const spotStore = useSpotStore()
const derivativeStore = useDerivativeStore()
const formValues = useFormValues<ActivityForm>()

const markets = computed<UiMarketWithToken[]>(() =>
  [ActivityTab.Spot, ActivityTab.WalletHistory].some((page) =>
    (route.name as string).startsWith(page)
  )
    ? spotStore.markets
    : derivativeStore.markets
)

const tokens = computed(() => {
  if (!markets.value) {
    return []
  }

  const tokens = markets.value.reduce((tokens, market) => {
    return [...tokens, market.baseToken, market.quoteToken]
  }, [] as Token[])

  const uniqueTokens = [
    ...new Map(tokens.map((token) => [token.denom, token])).values()
  ]

  return uniqueTokens
})

const selectedToken = computed(() => {
  if (!formValues.value[ActivityField.Denom]) {
    return undefined
  }

  return tokens.value.find(
    (token) => token.denom === formValues.value[ActivityField.Denom]
  )
})

const selectedDenoms = computed(() => {
  if (!selectedToken.value) {
    return []
  }

  return getDenomsFromToken(selectedToken.value)
})
</script>

<template>
  <div class="space-y-4">
    <PartialsActivityViewsPositions v-bind="{ denoms: selectedDenoms }" />
  </div>
</template>
