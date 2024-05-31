<script lang="ts" setup>
import { TradingStrategy } from '@injectivelabs/sdk-ts'
import { Status, StatusType } from '@injectivelabs/utils'
import { getSgtContractAddressFromSlug } from '@/app/utils/helpers'
import { Modal } from '@/types'
// import { mixpanelAnalytics } from '@/app/providers/mixpanel'

const props = defineProps({
  isLiquidity: Boolean,

  strategy: {
    type: Object as PropType<TradingStrategy>,
    required: true
  }
})

const spotStore = useSpotStore()
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

function removeStrategy() {
  if (!activeStrategy.value) {
    return
  }

  status.setLoading()

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
    .catch($onError)
    .finally(() => {
      status.setIdle()

      // todo: Ivan add support for mixpanel here and everywhere else we remove strategy
      // mixpanelAnalytics.trackRemoveStrategy({
      //   duration: durationFormatter(props.createdAt, Date.now()),
      //   market: gridStrategyStore.spotMarket?.slug || '',
      //   totalProfit: props.pnl,
      //   isLiquidity: props.isLiquidity
      // })
    })
}
</script>

<template>
  <div class="grid grid-cols-1 gap-4">
    <AppButton
      v-bind="{ status }"
      is-lg
      variant="danger"
      class="w-full"
      @click="removeStrategy"
    >
      {{ $t('sgt.endBot') }}
    </AppButton>
  </div>
</template>
