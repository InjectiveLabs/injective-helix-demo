<script lang="ts" setup>
import { TradingStrategy } from '@injectivelabs/sdk-ts'
import { Status, StatusType } from '@injectivelabs/utils'
import {
  durationFormatter,
  getSgtContractAddressFromSlug
} from '@/app/utils/helpers'
import { Modal } from '@/types'
import { mixpanelAnalytics } from '@/app/providers/mixpanel'

const props = defineProps({
  isLiquidity: Boolean,

  strategy: {
    type: Object as PropType<TradingStrategy>,
    required: true
  }
})

const spotStore = useSpotStore()
const walletStore = useSharedWalletStore()
const modalStore = useModalStore()
const gridStrategyStore = useGridStrategyStore()
const { t } = useLang()
const { $onError } = useNuxtApp()
const notificationStore = useSharedNotificationStore()

const status = reactive(new Status(StatusType.Idle))

const market = computed(
  () =>
    spotStore.markets.find(
      ({ marketId }) => marketId === props.strategy.marketId
    )!
)

const activeStrategy = computed(
  () =>
    gridStrategyStore.activeStrategies.find(
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

      mixpanelAnalytics.trackRemoveStrategy(
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
        walletStore.isAuthzWalletConnected || walletStore.isAutoSignEnabled
      "
      v-bind="{ status }"
      is-lg
      variant="danger"
      class="w-full"
      @click="removeStrategy"
    >
      <span v-if="walletStore.isAuthzWalletConnected">
        {{ $t('common.unauthorized') }}
      </span>

      <span class="v-else">{{ $t('sgt.endBot') }}</span>
    </AppButton>
  </div>
</template>
