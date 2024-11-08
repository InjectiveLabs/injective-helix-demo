<script lang="ts" setup>
import { INJ_LOGO_URL } from '@shared/utils/constant'
import { NuxtUiIcons } from '@shared/types'
import { getBridgeRedirectionUrl } from '@/app/utils/network'

enum BridgeStep {
  One = 'one',
  Two = 'two',
  Three = 'three',
  Four = 'four'
}

const imgList = {
  [BridgeStep.One]: '/images/home/bridge/one.png',
  [BridgeStep.Two]: '/images/home/bridge/two.png',
  [BridgeStep.Three]: '/images/home/bridge/three.png',
  [BridgeStep.Four]: '/images/home/bridge/four.png'
}

const activeStep = ref(BridgeStep.One)

const options = [
  {
    type: BridgeStep.One,
    title: 'home.gettingStarted.step1.title',
    description: 'home.gettingStarted.step1.description',
    icon: NuxtUiIcons.Bridge
  },
  {
    type: BridgeStep.Two,
    title: 'home.gettingStarted.step2.title',
    description: 'home.gettingStarted.step2.description',
    icon: NuxtUiIcons.Chain
  },
  {
    type: BridgeStep.Three,
    title: 'home.gettingStarted.step3.title',
    description: 'home.gettingStarted.step3.description',
    icon: NuxtUiIcons.Bitcoin
  },
  {
    type: BridgeStep.Four,
    title: 'home.gettingStarted.step4.title',
    description: 'home.gettingStarted.step4.description',
    icon: NuxtUiIcons.CheckmarkOutline
  }
]
</script>

<template>
  <div>
    <h1
      class="text-xl lg:text-4xl pb-1 whitespace-pre-wrap font-semibold text-center lg:mt-20 bg-gradient-to-r from-white to-coolGray-400 bg-clip-text text-transparent"
    >
      {{ $t('home.gettingStarted.title') }}
    </h1>

    <div class="grid grid-cols-1 lg:grid-cols-2 mt-10 gap-10">
      <div class="space-y-4">
        <div class="mt-8">
          <h2 class="text-2xl font-semibold mb-4 text-white">
            {{ $t('home.gettingStarted.description') }}
          </h2>

          <div class="text-sm mb-8 space-y-2">
            <i18n-t
              keypath="home.gettingStarted.description2"
              class="leading-5"
              tag="p"
            >
              <template #bridgeLink>
                <NuxtLink
                  :to="getBridgeRedirectionUrl()"
                  target="_blank"
                  class="text-blue-500 hover:text-blue-600"
                >
                  <span>{{ $t('home.gettingStarted.injectiveBridge') }}</span>
                </NuxtLink>
              </template>
            </i18n-t>

            <div class="flex items-center gap-2">
              <img :src="INJ_LOGO_URL" class="h-4 w-4 min-w-4" />
              <p>{{ $t('home.gettingStarted.gasRequirement') }}</p>
            </div>
          </div>
        </div>

        <SharedSelectorItem
          v-for="item in options"
          :key="`home-${item.type}`"
          v-model="activeStep"
          class="hover:bg-brand-875 p-6 rounded-lg cursor-pointer flex"
          :value="item.type"
        >
          <div class="flex-1 space-y-2 flex items-center space-x-6">
            <UIcon
              :name="item.icon"
              class="min-w-8 w-8 h-8"
              :class="{ 'text-blue-500': activeStep === item.type }"
            />

            <div class="flex-1">
              <div class="flex items-center justify-between">
                <h2
                  :class="{ 'text-blue-500': activeStep === item.type }"
                  class="text-xl xs:text-2xl xs:leading-8 font-semibold"
                >
                  {{ $t(item.title) }}
                </h2>

                <div class="rotate-180 text-coolGray-400">
                  <UIcon
                    :name="NuxtUiIcons.ArrowLeft"
                    class="h-6 w-6 min-w-6"
                  />
                </div>
              </div>

              <p
                :class="{ 'text-white': activeStep === item.type }"
                class="text-base text-coolGray-400 xs:leading-6 xs:min-h-12"
              >
                {{ $t(item.description) }}
              </p>
            </div>
          </div>
        </SharedSelectorItem>
      </div>

      <div class="flex justify-center items-center lg:ml-20">
        <NuxtLink :to="getBridgeRedirectionUrl()">
          <img
            class="m-auto object-contain max-h-[630px]"
            :src="imgList[activeStep]"
          />
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
