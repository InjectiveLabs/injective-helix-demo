<script lang="ts" setup>
import { NuxtUiIcons } from '@shared/types'
import { MainPage } from '@/types'

const { t } = useLang()
const route = useRoute()

const resourcesList = [
  {
    text: t('footer.institutional'),
    link: MainPage.Institutional
  },
  {
    text: t('footer.feeDiscounts'),
    link: MainPage.FeeDiscounts
  },
  {
    text: t('footer.privacyPolicy'),
    link: 'https://injectivelabs.org/privacy'
  }
]

const supportList = [
  {
    text: t('footer.docs'),
    link: 'https://docs.helixapp.com/'
  },
  {
    text: t('footer.apiDocumentation'),
    link: 'https://api.injective.exchange/'
  },
  {
    text: t('footer.termsAndConditions'),
    link: MainPage.Terms
  }
]
</script>

<template>
  <footer
    :class="[
      'relative z-[3] w-full py-16',
      route.name === MainPage.Index
        ? ''
        : 'bg-brand-900 border-t border-t-coolGray-900'
    ]"
  >
    <div
      class="w-full mx-auto lg:w-4/5 grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 3md:grid-cols-10 lg:grid-cols-12 gap-8 px-8 lg:px-0"
    >
      <div class="sm:col-span-1 xs:col-span-2 3md:col-span-3 lg:col-span-5">
        <NuxtLink :to="{ name: MainPage.Index }">
          <div class="flex items-center cursor-pointer md:mb-6">
            <AssetLogo class="h-10 w-10 mr-2" alt="Helix" />
            <AssetLogoText class="h-6 md:h-8" />
          </div>
        </NuxtLink>

        <span class="text-coolGray-500 text-xs">
          &copy; {{ new Date().getFullYear() }} Helix
        </span>
      </div>

      <div class="3md:col-span-2">
        <h3 class="font-bold text-lg mb-4">{{ $t('footer.resources') }}</h3>

        <div
          v-for="(item, index) in resourcesList"
          :key="`resource-list-${index}`"
          class="mt-4 text-sm"
        >
          <a
            v-if="item.link.startsWith('http')"
            :href="item.link"
            class="opacity-75 cursor-pointer hover:text-blue-500"
            target="_blank"
          >
            {{ item.text }}
          </a>
          <NuxtLink
            v-else-if="item.link"
            :to="{ name: item.link }"
            class="opacity-75 cursor-pointer hover:text-blue-500"
          >
            {{ item.text }}
          </NuxtLink>
        </div>
      </div>

      <div class="3md:col-span-2">
        <h3 class="font-bold text-lg mb-4">{{ $t('footer.support') }}</h3>

        <div
          v-for="(item, index) in supportList"
          :key="`support-list-${index}`"
          class="mt-4 text-sm"
        >
          <a
            v-if="item.link.startsWith('http')"
            :href="item.link"
            class="opacity-75 cursor-pointer hover:text-blue-500"
            target="_blank"
          >
            {{ item.text }}
          </a>
          <NuxtLink
            v-else-if="item.link"
            :to="{ name: item.link }"
            class="opacity-75 cursor-pointer hover:text-blue-500"
          >
            {{ item.text }}
          </NuxtLink>
        </div>
      </div>

      <div class="md:col-span-3">
        <h3 class="font-bold text-lg mb-4 md:mb-6">
          {{ $t('footer.community') }}
        </h3>

        <div class="flex items-center">
          <a
            class="w-6 h-6 mr-4"
            href="https://discord.com/invite/helixapp"
            target="_blank"
          >
            <div
              class="h-6 w-6 min-w-6 flex items-center justify-center bg-coolGray-500 hover:bg-blue-500 text-brand-900 rounded-full"
            >
              <UIcon :name="NuxtUiIcons.Discord" class="h-4 w-4 min-w-4" />
            </div>
          </a>

          <a
            class="w-6 h-6 text-coolGray-500 hover:text-blue-500 mr-4"
            href="https://twitter.com/helixapp_"
            target="_blank"
          >
            <UIcon :name="NuxtUiIcons.TwitterCircle" class="h-6 w-6 min-w-6" />
          </a>

          <a
            class="w-6 h-6 text-coolGray-500 hover:text-blue-500 mr-4"
            href="https://t.me/helixapp"
            target="_blank"
          >
            <UIcon :name="NuxtUiIcons.TelegramCircle" class="h-6 w-6 min-w-6" />
          </a>
        </div>
      </div>

      <div class="xs:col-span-2 sm:col-span-3 md:col-span-5 lg:hidden text-sm">
        {{ $t('footer.helixProvides') }}
      </div>
    </div>
  </footer>
</template>
