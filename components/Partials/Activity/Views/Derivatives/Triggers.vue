<script lang="ts" setup>
import { PropType } from 'vue'
import { Status, StatusType } from '@injectivelabs/utils'
import {
  executionOrderTypeToOrderTypes,
  executionOrderTypeToOrderExecutionTypes
} from '@/app/client/utils/activity'
import { ConditionalOrderSide, TradeTypes } from '@/types'

const derivativeStore = useDerivativeStore()
const { $onError } = useNuxtApp()
const { success } = useNotifications()
const { t } = useLang()

const props = defineProps({
  denoms: {
    type: Array as PropType<string[]>,
    default: () => []
  },

  side: {
    type: String,
    default: ''
  },

  type: {
    type: String,
    default: ''
  },

  status: {
    type: Object as PropType<Status>,
    default: () => new Status()
  }
})

const tabCountElement = document.getElementById(
  'activity-derivative-triggers-tab-count-default'
)
const actionStatus = reactive(new Status(StatusType.Idle))

const markets = computed(() =>
  derivativeStore.markets
    .filter((m) =>
      props.denoms.some((denom) =>
        [m.baseToken.denom, m.quoteDenom].includes(denom)
      )
    )
    .map(({ marketId }) => marketId)
)

const filteredTriggers = computed(() => {
  const orderTypes = executionOrderTypeToOrderTypes(props.type)
  const executionTypes = executionOrderTypeToOrderExecutionTypes(props.type)

  return derivativeStore.subaccountConditionalOrders.filter((order) => {
    const orderMatchesDenom =
      markets.value.length === 0 || markets.value.includes(order.marketId)
    const orderMatchesSide = !props.side || props.side === order.direction
    const orderMatchesOrderTypes =
      !orderTypes ||
      orderTypes.includes(order.orderType as ConditionalOrderSide)
    const orderMatchesExecutionTypes =
      !executionTypes ||
      executionTypes.includes(order.executionType as TradeTypes)

    return (
      orderMatchesDenom &&
      orderMatchesSide &&
      orderMatchesOrderTypes &&
      orderMatchesExecutionTypes
    )
  })
})

onMounted(() => tabCountElement?.classList.add('hidden'))
onUnmounted(() => tabCountElement?.classList.remove('hidden'))

function handleCancelOrders() {
  actionStatus.setLoading()

  const action =
    filteredTriggers.value.length === 1
      ? derivativeStore.cancelOrder(filteredTriggers.value[0])
      : derivativeStore.batchCancelOrder(filteredTriggers.value)

  action
    .then(() => {
      success({
        title: t('trade.orders_cancelled')
      })
    })
    .catch($onError)
    .finally(() => {
      actionStatus.setIdle()
    })
}
</script>

<template>
  <div>
    <Teleport to="#activity-derivative-triggers-tab-count">
      <span>({{ filteredTriggers.length }})</span>
    </Teleport>

    <Teleport to="#activity-toolbar-action">
      <AppButton
        v-if="filteredTriggers.length > 0"
        class="text-red-500 bg-red-500 bg-opacity-10 font-semibold hover:text-white"
        :status="actionStatus"
        data-cy="activity-cancel-all-button"
        @click="handleCancelOrders"
      >
        <span class="whitespace-nowrap">
          {{ $t('trade.cancelAllOrders') }}
        </span>
      </AppButton>
    </Teleport>

    <AppHocLoading
      class="h-full"
      :status="status"
      :loader-class="status.isLoading() ? 'relative' : ''"
    >
      <div class="w-full h-full">
        <!-- mobile table -->
        <CommonTableBody
          :show-empty="filteredTriggers.length === 0"
          class="sm:hidden mt-3 max-h-lg overflow-y-auto"
        >
          <PartialsCommonSubaccountTriggerMobile
            v-for="(trigger, index) in filteredTriggers"
            :key="`mobile-triggers-${index}-${trigger.orderHash}`"
            class="col-span-1"
            :trigger="trigger"
          />

          <template #empty>
            <CommonEmptyList
              :message="$t('trade.emptyTriggers')"
              class="pb-4 grow bg-gray-900"
            />
          </template>
        </CommonTableBody>

        <CommonTableWrapper break-md class="hidden sm:block">
          <table v-if="filteredTriggers.length > 0" class="table">
            <PartialsCommonSubaccountTriggerHeader />
            <tbody>
              <PartialsCommonSubaccountTriggerRow
                v-for="(trigger, index) in filteredTriggers"
                :key="`trigger-${index}-${trigger.orderHash}`"
                :trigger="trigger"
              />
            </tbody>
          </table>

          <CommonEmptyList
            v-else
            :message="$t('trade.emptyTriggers')"
            data-cy="universal-table-nothing-found"
            class="pb-4 grow"
          />
        </CommonTableWrapper>
      </div>
    </AppHocLoading>
  </div>
</template>
