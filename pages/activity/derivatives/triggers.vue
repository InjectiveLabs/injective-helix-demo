<script lang="ts" setup>
import { Status, StatusType } from '@injectivelabs/utils'
import {
  executionOrderTypeToOrderTypes,
  executionOrderTypeToOrderExecutionTypes
} from '@/app/client/utils/activity'
import {
  ActivityForm,
  ActivityPage,
  ConditionalOrderSide,
  TradeTypes
} from '@/types'

const derivativeStore = useDerivativeStore()
const { $onError } = useNuxtApp()
const { success } = useNotifications()
const { t } = useLang()

const formValues = useFormValues<ActivityForm>()

const actionStatus = reactive(new Status(StatusType.Idle))

const markets = computed(() =>
  derivativeStore.markets
    .filter((m) =>
      [m.baseToken.denom, m.quoteDenom].includes(formValues.value.Denom)
    )
    .map(({ marketId }) => marketId)
)

const filteredTriggers = computed(() => {
  const orderTypes = executionOrderTypeToOrderTypes(formValues.value.Type)
  const executionTypes = executionOrderTypeToOrderExecutionTypes(
    formValues.value.Type
  )

  return derivativeStore.subaccountConditionalOrders.filter((order) => {
    const orderMatchesDenom =
      markets.value.length === 0 || markets.value.includes(order.marketId)
    const orderMatchesSide =
      !formValues.value.Side || formValues.value.Side === order.direction
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
    <ClientOnly>
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

      <Teleport :to="`#${ActivityPage.DerivativeTriggers}`">
        <span class="ml-1">({{ filteredTriggers.length }})</span>
      </Teleport>
    </ClientOnly>

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
  </div>
</template>
