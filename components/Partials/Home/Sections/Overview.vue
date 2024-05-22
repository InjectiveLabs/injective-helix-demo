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
    title: 'home.overview.tradingBotsTitle',
    description: 'home.overview.tradingBotsDescription'
  },
  {
    type: OverviewSection.NewAccounts,
    title: 'home.overview.newAccountsTitle',
    description: 'home.overview.newAccountsDescription'
  },
  {
    type: OverviewSection.Pnl,
    title: 'home.overview.pnlTitle',
    description: 'home.overview.pnlDescription'
  },
  {
    type: OverviewSection.GasFree,
    title: 'home.overview.gasFreeTitle',
    description: 'home.overview.gasFreeDescription'
  }
]
</script>

<template>
  <div>
    <h2
      class="text-xl lg:text-3xl whitespace-pre-wrap text-center font-semibold lg:my-20 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent"
    >
      <i18n-t keypath="home.overview.title">
        <template #faster>
          <span class="italic">{{ $t('home.overview.faster') }}</span>
        </template>
      </i18n-t>
    </h2>

    <div class="grid grid-cols-1 lg:grid-cols-2 mt-10 gap-10">
      <div class="space-y-4">
        <BaseSelectorItem
          v-for="item in options"
          :key="`home-${item.type}`"
          v-model="activeType"
          class="hover:bg-brand-875 p-6 rounded-lg cursor-pointer flex"
          :value="item.type"
        >
          <div class="flex-1 space-y-2">
            <div class="flex items-center justify-between">
              <h2
                :class="{ 'text-blue-500': activeType === item.type }"
                class="text-xl xs:text-2xl xs:leading-8 font-semibold"
              >
                {{ $t(item.title) }}
              </h2>

              <div class="rotate-180 text-gray-400">
                <SharedIcon name="arrow" />
              </div>
            </div>

            <p
              :class="{ 'text-white': activeType === item.type }"
              class="text-base text-gray-400 xs:leading-6 xs:min-h-12"
            >
              {{ $t(item.description) }}
            </p>
          </div>
        </BaseSelectorItem>
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
