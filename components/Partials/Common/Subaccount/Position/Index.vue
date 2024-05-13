<script lang="ts" setup>
import { Position, PositionV2 } from '@injectivelabs/sdk-ts'
import { SharedMarketType } from '@shared/types'
import { Modal, UiDerivativeMarket } from '@/types'

const modalStore = useModalStore()
const positionStore = usePositionStore()
const derivativeStore = useDerivativeStore()

const props = defineProps({
  market: {
    type: Object as PropType<UiDerivativeMarket>,
    required: true
  }
})

const selectedPosition = ref<Position | PositionV2 | undefined>(undefined)

const filteredPositions = computed(() => {
  const result = positionStore.subaccountPositions.filter((position) => {
    return !!derivativeStore.markets.find(
      (m) => m.marketId === position.marketId
    )
  })

  if (props.market.subType === SharedMarketType.BinaryOptions) {
    return result.filter((position) =>
      derivativeStore.binaryOptionsMarkets.some(
        (market) => market.marketId === position.marketId
      )
    )
  }

  return result
})

const sortedPositions = computed(() => {
  return [...filteredPositions.value].sort((p1: Position, p2: Position) => {
    return p1.ticker.localeCompare(p2.ticker)
  })
})

onMounted(() => {
  positionStore.fetchOpenPositionsMarketsOrderbook()
})

function onSharePosition(position: Position | PositionV2) {
  selectedPosition.value = position
  modalStore.openModal(Modal.SharePosition)
}

useIntervalFn(() => {
  positionStore.fetchOpenPositionsMarketsOrderbook()
}, 10 * 1000)
</script>

<template>
  <div class="h-full">
    <!-- mobile table -->
    <CommonTableBody
      :is-empty="sortedPositions.length === 0"
      class="sm:hidden max-h-lg"
    >
      <PartialsCommonSubaccountPositionMobile
        v-for="(position, index) in sortedPositions"
        :key="`mobile-positions-${index}-${position.marketId}`"
        class="col-span-1"
        v-bind="{
          position
        }"
        @share:position="onSharePosition"
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
            @share:position="onSharePosition"
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
