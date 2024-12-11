<script setup lang="ts">
enum OverviewSection {
  AccountOverview = 'accountOverview',
  TradingBots = 'tradingBots',
  Pnl = 'pnl',
  GasFree = 'gasFree'
}

const imgList = {
  [OverviewSection.TradingBots]: '/images/home/tradingBots.png',
  [OverviewSection.AccountOverview]: '/images/home/AccountsOverview.png',
  [OverviewSection.Pnl]: '/images/home/PnL.png',
  [OverviewSection.GasFree]: '/images/home/gasFee.png'
}

const activeType = ref(OverviewSection.AccountOverview)

const options = [
  {
    type: OverviewSection.AccountOverview,
    title: 'home.overview.accountOverviewTitle',
    description: 'home.overview.accountOverviewDescription'
  },
  {
    type: OverviewSection.TradingBots,
    title: 'home.overview.tradingBotsTitle',
    description: 'home.overview.tradingBotsDescription'
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
  <div class="relative lg:mb-16 gsap-section">
    <div id="overview-section" class="relative my-8 lg:py-20">
      <div>
        <div class="pb-4">
          <h2
            class="text-xl lg:text-5xl pb-1 whitespace-pre-wrap text-center font-semibold bg-gradient-to-r from-white to-coolGray-400 bg-clip-text text-transparent"
          >
            <i18n-t keypath="home.overview.title">
              <template #faster>
                <span class="italic">{{ $t('home.overview.faster') }}</span>
              </template>
            </i18n-t>
          </h2>
          <p class="text-center text-lg text-white">
            {{ $t('home.overview.experienceTrading') }}
          </p>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 mt-10 gap-10">
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
                      <h2
                        class="text-xl xs:text-2xl xs:leading-8 font-semibold"
                      >
                        {{ $t(item.title) }}
                      </h2>
                    </div>
                  </div>

                  <p class="text-base lg:text-lg xs:leading-6 xs:min-h-12">
                    {{ $t(item.description) }}
                  </p>
                </div>
              </div>
            </SharedSelectorItem>
          </div>

          <div class="flex justify-center items-center lg:ml-20">
            <img
              class="max-lg:m-auto lg:ml-auto object-contain max-h-[530px]"
              :src="imgList[activeType]"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
