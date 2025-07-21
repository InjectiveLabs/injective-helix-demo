<script setup lang="ts">
import { NuxtUiIcons } from '@shared/types'
import { MainPage, TradeSubPage } from '@/types'

enum OverviewSection {
  GasFree = 'gasFree',
  LpRewards = 'lpRewards',
  TradingBots = 'tradingBots',
  TradeStocks = 'tradeStocks'
}

const animationList = {
  [OverviewSection.GasFree]: '4_gas_fees.json',
  [OverviewSection.LpRewards]: '3_lp_rewards.json',
  [OverviewSection.TradeStocks]: '2_trade_stocks.json',
  [OverviewSection.TradingBots]: '1_trading_bots.json'
}

const activeType = ref(OverviewSection.TradingBots)

const overviewList = [
  {
    type: OverviewSection.TradingBots,
    link: { name: MainPage.TradingBots },
    title: 'home.overview.tradingBotsTitle',
    description: 'home.overview.tradingBotsDescription'
  },
  {
    type: OverviewSection.TradeStocks,
    link: { name: TradeSubPage.Stocks },
    title: 'home.overview.tradeStocksTitle',
    description: 'home.overview.tradeStocksDescription'
  },
  {
    type: OverviewSection.LpRewards,
    link: { name: MainPage.LpRewards },
    title: 'home.overview.lpRewardsTitle',
    description: 'home.overview.lpRewardsDescription'
  },
  {
    type: OverviewSection.GasFree,
    title: 'home.overview.gasFreeTitle',
    description: 'home.overview.gasFreeDescription'
  }
]

onMounted(() => {
  const mm = gsap.matchMedia()

  mm.add('(min-width: 1024px)', () => {
    gsap.to('#overview-section', {
      scrollTrigger: {
        trigger: '#overview-section',
        start: 'top 0%',
        end: 'bottom 0%',
        scrub: true,
        pin: true,
        onUpdate: (self) => {
          if (self.progress === 1) {
            activeType.value = overviewList[overviewList.length - 1].type
            return
          }

          const index = Math.floor(self.progress * overviewList.length)
          activeType.value = overviewList[index].type
        }
      }
    })
  })
})
</script>

<template>
  <div class="relative gsap-section">
    <img
      src="/svg/blurs/blur-1.svg"
      class="absolute bottom-32 -right-[50%] -rotate-180 blur-xl pointer-events-none"
    />

    <img
      src="/svg/blurs/blur-1.svg"
      class="absolute -bottom-52 -left-[50%] -rotate-180 blur-xl pointer-events-none"
    />

    <div id="overview-section" class="relative max-lg:mt-28 lg:py-20">
      <h2
        class="text-2xl lg:text-5xl pb-1 whitespace-pre-wrap text-center font-semibold text-white"
      >
        {{ $t('home.overview.title') }}
      </h2>

      <p class="text-center text-lg text-white mt-4">
        {{ $t('home.overview.description') }}
      </p>

      <div class="flex max-lg:hidden mt-10 p-6 gap-16 bg-[#141620]">
        <div class="space-y-10 lg:space-y-12 flex-1">
          <SharedSelectorItem
            v-for="item in overviewList"
            :key="`home-${item.type}`"
            v-model="activeType"
            :value="item.type"
            :class="{ 'text-white': activeType === item.type }"
            class="hover:text-white cursor-pointer flex text-coolGray-475 transition-colors"
          >
            <div class="flex-1 flex items-center">
              <div class="flex-1 space-y-2">
                <h2 class="text-2xl leading-8 font-semibold">
                  {{ $t(item.title) }}
                </h2>

                <p class="text-lgleading-6min-h-12">
                  {{ $t(item.description) }}
                </p>
              </div>

              <NuxtLink
                v-if="item.link"
                :to="item.link"
                class="p-2 inline-flex"
              >
                <UIcon class="size-6" :name="NuxtUiIcons.ExternalLink2" />
              </NuxtLink>
            </div>
          </SharedSelectorItem>
        </div>

        <div class="flex justify-center items-center ml-20 min-w-[35%]">
          <Transition name="fade" mode="out-in">
            <CommonLottieAnimation
              :key="`home-${activeType}`"
              :name="animationList[activeType]"
              class="rounded-xl overflow-hidden size-[360px]"
            />
          </Transition>
        </div>
      </div>

      <PartialsHomeSectionsOverviewCarousel
        class="hidden max-lg:block"
        v-bind="{ overviewList, animationList }"
      />
    </div>
  </div>
</template>
