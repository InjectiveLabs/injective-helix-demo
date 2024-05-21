<script setup lang="ts">
enum OverviewSection {
  tradingBots = 'tradingBots',
  newAccounts = 'newAccounts',
  pnl = 'pnl',
  gasFree = 'gasFree'
}

const imgList = {
  [OverviewSection.tradingBots]: '/images/home/tradingBots.png',
  [OverviewSection.newAccounts]: '/images/home/newAccounts.png',
  [OverviewSection.pnl]: '/images/home/pnlOverview.png',
  [OverviewSection.gasFree]: '/images/home/gasFee.png'
}

const activeType = ref(OverviewSection.tradingBots)

const options = [
  {
    type: OverviewSection.tradingBots,
    title: 'overview.tradingBotsTitle',
    description: 'overview.tradingBotsDescription',
    img: '/images/home/tradingBots.png'
  },
  {
    type: OverviewSection.newAccounts,
    title: 'overview.newAccountsTitle',
    description: 'overview.newAccountsDescription',
    img: '/images/home/newAccounts.png'
  },
  {
    type: OverviewSection.pnl,
    title: 'overview.pnlTitle',
    description: 'overview.pnlDescription',
    img: '/images/home/pnlOverview.png'
  },
  {
    type: OverviewSection.gasFree,
    title: 'overview.gasFreeTitle',
    description: 'overview.gasFreeDescription',
    img: '/images/home/gasFee.png'
  }
]
</script>

<template>
  <div>
    <h2
      class="text-xl lg:text-3xl whitespace-pre-wrap text-center font-semibold lg:my-20"
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

      <div>
        <img class="h-[400px] mx-auto" :src="imgList[activeType]" alt="" />
      </div>
    </div>
  </div>
</template>
