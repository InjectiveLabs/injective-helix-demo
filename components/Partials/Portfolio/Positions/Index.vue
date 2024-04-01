<script setup lang="ts">
import { PositionsFilterField } from '~/types'
import { PositionsFilterForm } from '~/types/forms'

const accountStore = useAccountStore()
const positionStore = usePositionStore()

const { values } = useForm<PositionsFilterForm>()

const filteredPosition = computed(() =>
  positionStore.positions.filter((position) => {
    const isPartOfMarket = values[PositionsFilterField.Market]
      ? position.marketId === values[PositionsFilterField.Market]
      : true

    const isPartOfSide = values[PositionsFilterField.Side]
      ? position.direction === values[PositionsFilterField.Side]
      : true

    const isPartOfSubaccount =
      position.subaccountId === accountStore.subaccountId

    return isPartOfMarket && isPartOfSide && isPartOfSubaccount
  })
)
</script>

<template>
  <PartialsPortfolioPositionsTabs />
  <PartialsPortfolioPositionsTableHeader />
  <PartialsPortfolioPositionsTableRow
    v-for="position in filteredPosition"
    :key="`${position.marketId}-${position.subaccountId}`"
    v-bind="{ position }"
  />
</template>
