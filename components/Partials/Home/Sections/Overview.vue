<script setup lang="ts">
import { NuxtUiIcons } from '@shared/types'

enum OverviewSection {
  TradingBots = 'tradingBots',
  NewAccounts = 'newAccounts',
  Pnl = 'pnl',
  GasFree = 'gasFree'
}

const imgList = {
  [OverviewSection.TradingBots]: '/images/home/tradingBots.png',
  [OverviewSection.NewAccounts]: '/images/home/newAccounts.png',
  [OverviewSection.Pnl]: '/images/home/pnlOverview.png',
  [OverviewSection.GasFree]: '/images/home/gasFee.png'
}

const activeType = ref(OverviewSection.TradingBots)

const options = [
  {
    type: OverviewSection.TradingBots,
    title: 'home.overview.tradingBotsTitle',
    description: 'home.overview.tradingBotsDescription',
    icon: NuxtUiIcons.Robot
  },
  {
    type: OverviewSection.NewAccounts,
    title: 'home.overview.newAccountsTitle',
    description: 'home.overview.newAccountsDescription',
    icon: NuxtUiIcons.Notebook
  },
  {
    type: OverviewSection.Pnl,
    title: 'home.overview.pnlTitle',
    description: 'home.overview.pnlDescription',
    icon: NuxtUiIcons.BarChart
  },
  {
    type: OverviewSection.GasFree,
    title: 'home.overview.gasFreeTitle',
    description: 'home.overview.gasFreeDescription',
    icon: NuxtUiIcons.Gas
  }
]
</script>

<template>
  <div>
    <h2
      class="text-xl lg:text-5xl pb-1 whitespace-pre-wrap text-center font-semibold lg:my-20 bg-gradient-to-r from-white to-coolGray-400 bg-clip-text text-transparent"
    >
      <i18n-t keypath="home.overview.title">
        <template #faster>
          <span class="italic">{{ $t('home.overview.faster') }}</span>
        </template>
      </i18n-t>
    </h2>

    <div class="grid grid-cols-1 lg:grid-cols-2 mt-10 gap-10">
      <div class="space-y-4">
        <SharedSelectorItem
          v-for="item in options"
          :key="`home-${item.type}`"
          v-model="activeType"
          class="hover:bg-brand-875 p-6 rounded-lg cursor-pointer flex"
          :value="item.type"
        >
          <div class="flex-1 space-y-2 flex items-center space-x-6">
            <UIcon
              :name="item.icon"
              :class="[
                item.icon === NuxtUiIcons.BarChart
                  ? 'min-w-8 w-8 h-8'
                  : 'min-w-9 w-9 h-9',
                { 'text-blue-500': activeType === item.type }
              ]"
            />

            <div class="flex-1 space-y-2">
              <div class="flex items-center justify-between">
                <div class="flex justify-center items-center space-x-3">
                  <h2
                    :class="{ 'text-blue-500': activeType === item.type }"
                    class="text-xl xs:text-2xl xs:leading-8 font-semibold"
                  >
                    {{ $t(item.title) }}
                  </h2>
                  <div
                    v-if="item.type === OverviewSection.NewAccounts"
                    class="p-1 text-[10px] font-semibold rounded-[4px] bg-[#E79E11] uppercase"
                  >
                    {{ $t('common.new') }}
                  </div>
                </div>

                <div class="rotate-180 text-coolGray-400">
                  <UIcon
                    :name="NuxtUiIcons.ArrowLeft"
                    class="h-6 w-6 min-w-6"
                  />
                </div>
              </div>

              <p
                :class="{ 'text-white': activeType === item.type }"
                class="text-base text-coolGray-400 xs:leading-6 xs:min-h-12"
              >
                {{ $t(item.description) }}
              </p>
            </div>
          </div>
        </SharedSelectorItem>
      </div>

      <div class="flex justify-center lg:ml-20">
        <img
          class="m-auto object-contain max-h-[630px]"
          :src="imgList[activeType]"
        />
      </div>
    </div>
  </div>
</template>
