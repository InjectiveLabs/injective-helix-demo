<script lang="ts" setup>
import { Status, StatusType } from '@injectivelabs/utils'
import { ActivitySubPage } from '@/types'

const accountStore = useAccountStore()
const spotStore = useSpotStore()
const route = useRoute()
const { t } = useLang()
const { $onError } = useNuxtApp()

const status = reactive(new Status(StatusType.Loading))

const tabs = [
  {
    label: t('activity.openOrders'),
    value: ActivitySubPage.Spot
  },
  {
    label: t('activity.orderHistory'),
    value: ActivitySubPage.SpotOrderHistory
  },
  {
    label: t('activity.tradeHistory'),
    value: ActivitySubPage.SpotTradeHistory
  },
  {
    label: t('activity.swapHistory'),
    value: ActivitySubPage.SpotSwapHistory
  }
]

function fetchData() {
  status.setLoading()

  Promise.all([spotStore.fetchSubaccountOrders()])
    .catch($onError)
    .finally(() => {
      status.setIdle()
    })
}

watch(
  () => accountStore.subaccountId,
  () => {
    fetchData()
  },
  { immediate: true }
)
</script>

<template>
  <AppHocLoading v-bind="{ status }">
    <div class="flex space-x-4 mb-4 flex-wrap">
      <template v-for="(tab, index) in tabs" :key="`subtab-${tab.label}`">
        <CommonSeparator v-if="index !== 0" />

        <PartialsActivityCommonLinkTab
          v-bind="{
            to: {
              name: tab.value
            }
          }"
        >
          <span>{{ tab.label }}</span>
          <span :id="tab.value" />

          <span
            v-if="
              route.name !== ActivitySubPage.Spot &&
              tab.value === ActivitySubPage.Spot
            "
            class="ml-1"
          >
            ({{ spotStore.subaccountOrders.length }})
          </span>
        </PartialsActivityCommonLinkTab>
      </template>
    </div>

    <div class="h-full rounded-xl overflow-y-auto">
      <CommonCard is-md class="h-full-flex">
        <div class="h-full-flex space-y-4">
          <PartialsActivityCommonToolbar />
          <NuxtPage />
        </div>
      </CommonCard>
    </div>
  </AppHocLoading>
</template>
