<script lang="ts" setup>
import { Status, StatusType } from '@injectivelabs/utils'
import { ActivitySubPage } from '@/types'

const accountStore = useAccountStore()
const positionStore = usePositionStore()
const route = useRoute()
const { t } = useLang()
const { $onError } = useNuxtApp()

const status = reactive(new Status(StatusType.Loading))

const tabs = [
  {
    label: t('activity.openPositions'),
    value: ActivitySubPage.Positions
  },
  {
    label: t('activity.fundingPayments'),
    value: ActivitySubPage.PositionsFundingPayments
  }
]

function fetchData() {
  status.setLoading()

  Promise.all([positionStore.fetchSubaccountPositions()])
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
    <div class="flex mb-4 gap-4">
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
              route.name !== ActivitySubPage.Positions &&
              tab.value === ActivitySubPage.Positions
            "
            class="ml-1"
          >
            ({{ positionStore.subaccountPositionsCount }})
          </span>
        </PartialsActivityCommonLinkTab>
      </template>
    </div>

    <div class="h-full rounded-xl overflow-y-auto">
      <CommonCard is-md class="h-full-flex space-y-4">
        <PartialsActivityCommonToolbar />

        <div class="h-full-flex">
          <NuxtPage />
        </div>
      </CommonCard>
    </div>
  </AppHocLoading>
</template>
