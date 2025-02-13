<script lang="ts" setup>
import { TradingStrategy } from '@injectivelabs/sdk-ts'
import { Status, StatusType } from '@injectivelabs/utils'
import {
  durationFormatter,
  getSgtContractAddressFromSlug
} from '@/app/utils/helpers'
import * as EventTracker from '@/app/providers/mixpanel/EventTracker'
import { Modal } from '@/types'

const props = withDefaults(
  defineProps<{
    strategy: TradingStrategy
    isLiquidity?: boolean
  }>(),
  {
    strategy: undefined,
    isLiquidity: false
  }
)

const spotStore = useSpotStore()
const modalStore = useSharedModalStore()
const gridStrategyStore = useGridStrategyStore()
const sharedWalletStore = useSharedWalletStore()
const notificationStore = useSharedNotificationStore()
const { t } = useLang()
const { $onError } = useNuxtApp()

const status = reactive(new Status(StatusType.Idle))

const market = computed(
  () =>
    spotStore.markets.find(
      ({ marketId }) => marketId === props.strategy.marketId
    )!
)

const activeStrategy = computed(
  () =>
    gridStrategyStore.activeSpotStrategies.find(
      (strategy) =>
        strategy.contractAddress ===
        getSgtContractAddressFromSlug(market.value.slug)
    )!
)

const { pnl } = useActiveGridStrategy(market, activeStrategy)

function removeStrategy() {
  if (!activeStrategy.value) {
    return
  }

  status.setLoading()

  let err: Error

  gridStrategyStore
    .removeStrategyForSubaccount(
      activeStrategy.value.contractAddress,
      activeStrategy.value.subaccountId
    )
    .then(() => {
      modalStore.closeModal(Modal.GridStrategyDetails)

      notificationStore.success({
        title: t('sgt.success'),
        description: t('sgt.strategyRemoved')
      })
    })
    .catch((e) => {
      err = e
      $onError(e)
    })
    .finally(() => {
      status.setIdle()

      EventTracker.trackRemoveStrategy(
        {
          duration: durationFormatter(props.strategy.createdAt, Date.now()),
          market: market.value.slug,
          pnl: pnl.value.toFixed(),
          isLiquidity: props.isLiquidity
        },
        err?.message
      )
    })
}
</script>

<template>
  <div class="grid grid-cols-1 gap-4">
    <AppButton
      :disabled="
        sharedWalletStore.isAuthzWalletConnected ||
        sharedWalletStore.isAutoSignEnabled
      "
      v-bind="{ status }"
      size="lg"
      variant="danger"
      class="w-full"
      @click="removeStrategy"
    >
      <span v-if="sharedWalletStore.isAuthzWalletConnected">
        {{ $t('common.unauthorized') }}
      </span>

      <span class="v-else">{{ $t('sgt.endBot') }}</span>
    </AppButton>
  </div>
</template>
