<script lang="ts" setup>
import { Status, StatusType } from '@injectivelabs/utils'
import { PortfolioType } from '@/types'

const accountStore = useAccountStore()

const { $onError } = useNuxtApp()

const activePortfolioTab = ref(PortfolioType.Account)
const status = reactive(new Status(StatusType.Loading))

onMounted(() => {
  accountStore
    .fetchAccountStats()
    .catch($onError)
    .finally(() => status.setIdle())
})

function onClickPnlTab() {
  activePortfolioTab.value = PortfolioType.Pnl
}

function onClickAccountTab() {
  activePortfolioTab.value = PortfolioType.Account
}
</script>

<template>
  <div class="p-4">
    <h1 class="portfolio-title">{{ $t('navigation.portfolio') }}</h1>

    <PartialsPortfolioPortfolioFeeDiscounts />

    <div class="flex flex-col gap-8">
      <div class="border rounded-xl">
        <div class="flex">
          <span
            :class="{
              'border-blue-300': activePortfolioTab === PortfolioType.Account
            }"
            class="py-3.5 flex-1 text-sm font-medium border-b-2 text-center cursor-pointer"
            @click="onClickAccountTab"
          >
            {{ $t('portfolio.tab.account') }}
          </span>
          <span
            :class="{
              'border-blue-300': activePortfolioTab === PortfolioType.Pnl
            }"
            class="py-3.5 flex-1 text-sm font-medium border-b-2 text-center cursor-pointer"
            @click="onClickPnlTab"
          >
            {{ $t('portfolio.tab.pnl') }}
          </span>
        </div>

        <PartialsPortfolioPortfolioBalanceChartWrapper
          v-show="activePortfolioTab === PortfolioType.Account"
        />
        <PartialsPortfolioPortfolioPnLChartWrapper
          v-show="activePortfolioTab === PortfolioType.Pnl"
        />
      </div>

      <AppHocLoading v-bind="{ status }">
        <PartialsPortfolioPortfolioKeyStats />
      </AppHocLoading>
    </div>
  </div>
</template>
