<script lang="ts" setup>
import { PropType } from 'vue'
import {
  MarketType,
  UiDerivativeMarketWithToken,
  UiPosition
} from '@injectivelabs/sdk-ui-ts'
import { Modal } from '@/types'

const modalStore = useModalStore()
const positionStore = usePositionStore()
const derivativeStore = useDerivativeStore()

const props = defineProps({
  market: {
    type: Object as PropType<UiDerivativeMarketWithToken>,
    required: true
  }
})

const selectedPosition = ref<UiPosition | undefined>(undefined)

const filteredPositions = computed(() => {
  const result = positionStore.subaccountPositions.filter((position) => {
    return !!derivativeStore.markets.find(
      (m) => m.marketId === position.marketId
    )
  })

  if (props.market.subType === MarketType.BinaryOptions) {
    return result.filter((position) =>
      derivativeStore.binaryOptionsMarkets.some(
        (market) => market.marketId === position.marketId
      )
    )
  }

  return result
})

const sortedPositions = computed(() => {
  return [...filteredPositions.value].sort((p1: UiPosition, p2: UiPosition) => {
    return p1.ticker.localeCompare(p2.ticker)
  })
})

onMounted(() => {
  positionStore.fetchOpenPositionsMarketsOrderbook()
})

function handleSharePosition(position: UiPosition) {
  selectedPosition.value = position
  modalStore.openModal({ type: Modal.SharePosition })
}

useIntervalFn(() => {
  positionStore.fetchOpenPositionsMarketsOrderbook()
}, 10 * 1000)
</script>

<template>
  <div class="h-full">
    <!-- mobile table -->
    <CommonTableBody
      :show-empty="sortedPositions.length === 0"
      class="sm:hidden max-h-lg"
    >
      <PartialsCommonSubaccountPositionMobile
        v-for="(position, index) in sortedPositions"
        :key="`mobile-positions-${index}-${position.marketId}`"
        class="col-span-1"
        v-bind="{
          position
        }"
        @share:position="handleSharePosition"
      />

      <template #empty>
        <CommonEmptyList
          :message="$t('trade.emptyPositions')"
          class="min-h-orders bg-gray-900"
        />
      </template>
    </CommonTableBody>

    <CommonTableWrapper class="hidden sm:block">
      <table v-if="sortedPositions.length > 0" class="table">
        <PartialsCommonSubaccountPositionHeader />
        <tbody>
          <PartialsCommonSubaccountPositionRow
            v-for="(position, index) in sortedPositions"
            :key="`positions-${index}-${position.marketId}`"
            v-bind="{
              position
            }"
            @share:position="handleSharePosition"
          />
        </tbody>
      </table>
      <CommonEmptyList v-else :message="$t('trade.emptyPositions')" />
    </CommonTableWrapper>

    <ModalsSharePosition
      v-if="selectedPosition"
      v-bind="{ position: selectedPosition }"
    />
  </div>
</template>
