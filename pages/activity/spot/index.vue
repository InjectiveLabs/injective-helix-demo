<script lang="ts" setup>
import { Status, StatusType } from '@injectivelabs/utils'
import { ActivityForm, ActivitySubPage } from '@/types'

const spotStore = useSpotStore()
const accountStore = useAccountStore()
const { success } = useNotifications()
const { $onError } = useNuxtApp()
const { t } = useLang()

const actionStatus = reactive(new Status(StatusType.Idle))
const formValues = useFormValues<ActivityForm>()

const markets = computed(() =>
  spotStore.markets
    .filter((m) =>
      [m.baseToken.denom, m.quoteToken.denom].includes(formValues.value.Denom)
    )
    .map(({ marketId }) => marketId)
)

const filteredOrders = computed(() =>
  spotStore.subaccountOrders.filter((order) => {
    const orderMatchesDenom =
      !formValues.value.Denom || markets.value.includes(order.marketId)
    const orderMatchesSide =
      !formValues.value.Side || formValues.value.Side === order.orderSide
    return orderMatchesDenom && orderMatchesSide
  })
)

function onCancelOrders() {
  actionStatus.setLoading()

  const action =
    filteredOrders.value.length === 1
      ? spotStore.cancelOrder(filteredOrders.value[0])
      : spotStore.batchCancelOrder(filteredOrders.value)

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
          v-if="filteredOrders.length > 0 && !accountStore.isSgtSubaccount"
          class="text-red-500 bg-red-500 bg-opacity-10 font-semibold hover:text-white"
          :is-loading="actionStatus.isLoading()"
          data-cy="activity-cancel-all-button"
          @click="onCancelOrders"
        >
          <span class="whitespace-nowrap">
            {{ $t('trade.cancelAllOrders') }}
          </span>
        </AppButton>
      </Teleport>

      <Teleport :to="`#${ActivitySubPage.Spot}`">
        <span class="ml-1">({{ filteredOrders.length }})</span>
      </Teleport>
    </ClientOnly>

    <div class="w-full h-full">
      <!-- mobile table -->
      <CommonTableBody
        :is-empty="filteredOrders.length === 0"
        class="sm:hidden mt-3 max-h-lg overflow-y-auto"
      >
        <PartialsCommonSubaccountOrderMobile
          v-for="(order, index) in filteredOrders"
          :key="`mobile-spot-orders-${index}-${order.orderHash}`"
          class="col-span-1"
          :is-spot="true"
          :order="order"
        />

        <template #empty>
          <CommonEmptyList
            :message="$t('trade.emptyOrders')"
            class="pb-4 grow bg-gray-900"
          />
        </template>
      </CommonTableBody>

      <CommonTableWrapper is-break-md class="hidden sm:block">
        <table v-if="filteredOrders.length > 0" class="table">
          <PartialsCommonSubaccountOrderHeader is-spot />
          <tbody>
            <PartialsCommonSubaccountOrderRow
              v-for="(order, index) in filteredOrders"
              :key="`orders-${index}-${order.orderHash}`"
              :order="order"
              is-spot
            />
          </tbody>
        </table>

        <CommonEmptyList
          v-else
          :message="$t('trade.emptyOrders')"
          data-cy="universal-table-nothing-found"
          class="pb-4 grow"
        />
      </CommonTableWrapper>
    </div>
  </div>
</template>
