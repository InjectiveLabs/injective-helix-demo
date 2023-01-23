<script lang="ts" setup>
import { Status, StatusType } from '@injectivelabs/utils'
import { GeneralException } from '@injectivelabs/exceptions'

const derivativeStore = useDerivativeStore()
const positionStore = usePositionStore()

const { $onError } = useNuxtApp()
const { success } = useNotifications()
const { t } = useLang()

const status = reactive(new Status(StatusType.Idle))

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
    v-if="positionStore.subaccountPositions.length > 0"
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
