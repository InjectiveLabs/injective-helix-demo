<script lang="ts" setup>
import { Status, StatusType } from '@injectivelabs/utils'
import { GeneralException } from '@injectivelabs/exceptions'

const derivativeStore = useDerivativeStore()
const positionStore = usePositionStore()
const { $onError } = useNuxtApp()
const { success } = useNotifications()
const { t } = useLang()

const props = defineProps({
  denom: {
    type: String,
    default: ''
  },

  side: {
    type: String,
    default: ''
  },

  view: {
    type: String,
    required: true
  }
})

const status = reactive(new Status(StatusType.Idle))

const market = computed(() => {
  return derivativeStore.markets.find(
    (m) =>
      m.baseToken.denom === props.denom || m.quoteToken.denom === props.denom
  )
})

const positions = computed(() => {
  return positionStore.subaccountPositions
})

const showCloseButton = computed(() => {
  if (positions.value.length === 0) {
    return false
  }

  const result = positions.value.filter((position) => {
    const sideMatch =
      props.side !== '' ? props.side === position.direction : true
    const marketMatch = market.value
      ? market.value.marketId === position.marketId
      : true

    return sideMatch && marketMatch
  })

  return result.length > 0
})

function handleClosePositions() {
  status.setLoading()

  const action =
    positionStore.subaccountPositions.length === 1
      ? closePosition
      : closeAllPositions

  action()
    .then(() => {
      success({
        title: t('trade.positions_closed')
      })
    })
    .catch($onError)
    .finally(() => {
      status.setIdle()
    })
}

function closeAllPositions() {
  return positionStore.closeAllPosition(positionStore.subaccountPositions)
}

function closePosition() {
  const [position] = positionStore.subaccountPositions

  const market = derivativeStore.markets.find(
    (m) => m.marketId === position.marketId
  )

  if (!market) {
    return Promise.reject(
      new GeneralException(
        Error(
          t('trade.position_market_not_found', {
            marketId: position.marketId
          })
        )
      )
    )
  }

  return positionStore.closePosition({
    position,
    market
  })
}
</script>

<template>
  <AppButton
    v-if="showCloseButton"
    class="text-red-500 bg-red-500 bg-opacity-10 font-semibold hover:text-white"
    :status="status"
    data-cy="activity-cancel-all-button"
    @click="handleClosePositions"
  >
    <span class="whitespace-nowrap">
      {{ $t('trade.closeAllPositions') }}
    </span>
  </AppButton>
</template>
