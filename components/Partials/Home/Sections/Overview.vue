<script setup lang="ts">
enum OverviewSection {
  TradingBots = 'tradingBots',
  TradeStocks = 'tradeStocks',
  LpRewards = 'lpRewards',
  GasFree = 'gasFree'
}

const animationList = {
  [OverviewSection.TradingBots]: '2TradingBots.json',
  [OverviewSection.TradeStocks]: '1AccountOverview.json',
  [OverviewSection.LpRewards]: '3pnlAnalysis.json',
  [OverviewSection.GasFree]: '4gasFees.json'
}

const activeType = ref(OverviewSection.TradeStocks)

const options = [
  {
    type: OverviewSection.TradingBots,
    title: 'home.overview.tradingBotsTitle',
    description: 'home.overview.tradingBotsDescription'
  },
  {
    type: OverviewSection.TradeStocks,
    title: 'home.overview.tradeStocksTitle',
    description: 'home.overview.tradeStocksDescription'
  },
  {
    type: OverviewSection.LpRewards,
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
            activeType.value = options[options.length - 1].type
            return
          }

          const index = Math.floor(self.progress * options.length)
          activeType.value = options[index].type
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
      class="absolute bottom-32 -right-[50%] -rotate-180 blur-xl"
    />

    <img
      src="/svg/blurs/blur-1.svg"
      class="absolute -bottom-52 -left-[50%] -rotate-180 blur-xl"
    />

    <div id="overview-section" class="relative max-lg:mt-10 lg:py-20">
      <h2
        class="text-2xl lg:text-5xl pb-1 whitespace-pre-wrap text-center font-semibold text-white"
      >
        {{ $t('home.overview.title') }}
      </h2>

      <p class="text-center text-lg text-white mt-4">
        {{ $t('home.overview.description') }}
      </p>

      <div class="grid grid-cols-1 lg:grid-cols-2 mt-10 gap-16">
        <div class="space-y-12">
          <SharedSelectorItem
            v-for="item in options"
            :key="`home-${item.type}`"
            v-model="activeType"
            class="hover:text-white cursor-pointer flex text-coolGray-475 transition-colors"
            :class="{ 'text-white': activeType === item.type }"
            :value="item.type"
          >
            <div class="flex-1 space-y-2 flex items-center space-x-6">
              <div class="flex-1 space-y-2">
                <div class="flex items-center justify-between">
                  <div class="flex justify-center items-center space-x-3">
                    <h2 class="text-xl lg:text-2xl xs:leading-8 font-semibold">
                      {{ $t(item.title) }}
                    </h2>
                  </div>
                </div>

                <p class="text-base lg:text-lg lg:leading-6 lg:min-h-12">
                  {{ $t(item.description) }}
                </p>
              </div>
            </div>
          </SharedSelectorItem>
        </div>

        <div class="flex justify-center items-center lg:ml-20">
          <div class="max-lg:h-[400px]">
            <Transition name="fade">
              <CommonLottieAnimation
                :key="`home-${activeType}`"
                class="rounded-xl overflow-hidden"
                :name="animationList[activeType]"
              />
            </Transition>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
