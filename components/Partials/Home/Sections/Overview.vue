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
  <div class="relative">
    <AppBlur
      class="absolute top-full -translate-y-full right-32 translate-x-1/2 rotate-45 opacity-15 scale-50 text-blue-500"
    />

    <div id="overview-section" class="relative">
      <div class="min-h-[900px]">
        <div class="lg:py-20">
          <h2
            class="text-xl lg:text-5xl pb-1 whitespace-pre-wrap text-center font-semibold bg-gradient-to-r from-white to-coolGray-400 bg-clip-text text-transparent"
          >
            <i18n-t keypath="home.overview.title">
              <template #faster>
                <span class="italic">{{ $t('home.overview.faster') }}</span>
              </template>
            </i18n-t>
          </h2>
          <p class="text-center text-lg text-coolGray-400">
            {{ $t('home.overview.experienceTrading') }}
          </p>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 mt-10 gap-10">
          <div class="space-y-4">
            <SharedSelectorItem
              v-for="item in options"
              :key="`home-${item.type}`"
              v-model="activeType"
              class="hover:bg-brand-875 px-6 py-2 rounded-lg cursor-pointer flex"
              :value="item.type"
            >
              <div class="flex-1 space-y-2 flex items-center space-x-6">
                <div class="flex-1 space-y-2">
                  <div class="flex items-center justify-between">
                    <div class="flex justify-center items-center space-x-3">
                      <h2
                        :class="{
                          'text-white': activeType === item.type,
                          'text-coolGray-600': activeType !== item.type
                        }"
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
    </div>
  </div>
</template>
