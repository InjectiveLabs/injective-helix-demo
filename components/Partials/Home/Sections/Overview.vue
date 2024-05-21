<script setup lang="ts">
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
    title: 'overview.tradingBotsTitle',
    description: 'overview.tradingBotsDescription',
    img: '/images/home/tradingBots.png'
  },
  {
    type: OverviewSection.NewAccounts,
    title: 'overview.newAccountsTitle',
    description: 'overview.newAccountsDescription',
    img: '/images/home/newAccounts.png'
  },
  {
    type: OverviewSection.Pnl,
    title: 'overview.pnlTitle',
    description: 'overview.pnlDescription',
    img: '/images/home/pnlOverview.png'
  },
  {
    type: OverviewSection.GasFree,
    title: 'overview.gasFreeTitle',
    description: 'overview.gasFreeDescription',
    img: '/images/home/gasFee.png'
  }
]
</script>

<template>
  <div>
    <h2
      class="text-xl lg:text-3xl whitespace-pre-wrap text-center font-semibold lg:my-20 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent"
    >
      {{ $t('home.overviewTitle') }}
    </h2>

    <div class="grid grid-cols-1 lg:grid-cols-2 mt-10 gap-10">
      <div>
        <BaseSelectorItem
          v-for="item in options"
          :key="`home-${item.type}`"
          v-model="activeType"
          class="hover:bg-brand-875 p-6 rounded-lg cursor-pointer flex"
          :value="item.type"
        >
          <div class="flex-1">
            <h2
              :class="{ 'text-blue-500': activeType === item.type }"
              class="text-xl"
            >
              {{ $t(`home.${item.title}`) }}
            </h2>
            <p
              :class="{ 'text-white': activeType === item.type }"
              class="text-xs text-gray-400"
            >
              {{ $t(`home.${item.description}`) }}
            </p>
          </div>
          <div class="flex items-center">
            <div class="rotate-180 text-gray-400">
              <SharedIcon name="arrow" />
            </div>
          </div>
        </BaseSelectorItem>
      </div>

      <div class="max-h-[400px] flex justify-center">
        <img
          class="m-auto object-contain"
          :class="[
            activeType === OverviewSection.TradingBots
              ? 'h-full'
              : 'lg:h-1/2 max-lg:h-full'
          ]"
          :src="imgList[activeType]"
        />
      </div>
    </div>
  </div>
</template>
