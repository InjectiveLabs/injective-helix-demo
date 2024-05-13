<script lang="ts" setup>
import { ActivitySubPage } from '@/types'

defineProps({
  isLoading: Boolean
})

const spotStore = useSpotStore()
const accountStore = useAccountStore()
const positionStore = usePositionStore()
const derivativeStore = useDerivativeStore()

const { t } = useLang()

const tabs = computed(() => [
  {
    label: t('activity.positions'),
    to: { name: ActivitySubPage.Positions },
    count: positionStore.subaccountPositionsCount
  },
  {
    label: t('activity.derivativeOrders'),
    to: { name: ActivitySubPage.Derivatives },
    count: derivativeStore.subaccountOrdersCount
  },
  {
    label: t('activity.spotOrders'),
    to: { name: ActivitySubPage.Spot },
    count: spotStore.subaccountOrdersCount
  },
  {
    label: t('activity.walletHistory'),
    to: { name: ActivitySubPage.WalletHistory }
  }
])

const tabsFiltered = computed(() =>
  accountStore.isSgtSubaccount
    ? tabs.value.filter(
        (tab) =>
          tab.label !== t('activity.positions') &&
          tab.label !== t('activity.derivativeOrders')
      )
    : tabs.value
)
</script>

<template>
  <div class="overflow-x-auto hide-scrollbar flex-none">
    <div class="flex lg:grid grid-cols-4 gap-4">
      <CommonCardLink
        v-for="tab in tabsFiltered"
        v-bind="{ to: tab.to, isLoading }"
        :key="`tab-${tab.label}`"
      >
        <span>{{ tab.label }}</span>

        <template v-if="tab.count" #icon>
          {{ tab.count }}
        </template>

        <template v-else #icon>
          <SharedIcon name="wallet" class="w-3 md:w-3.5 h-auto" />
        </template>
      </CommonCardLink>
    </div>
  </div>
</template>
