<script lang="ts" setup>
import { NuxtUiIcons } from '@shared/types'
import { MainPage } from '@/types'

const socialLinks = [
  { icon: NuxtUiIcons.Discord, link: 'https://discord.com/invite/helixapp' },
  { icon: NuxtUiIcons.TwitterX, link: 'https://twitter.com/Injective_' },
  { icon: NuxtUiIcons.Telegram, link: 'https://t.me/joininjective' }
]
</script>

<template>
  <div class="bg-coolGray-900">
    <div class="max-w-7xl mx-auto px-4 md:px-8">
      <div
        class="flex flex-col lg:flex-row justify-between items-center py-8 gap-8"
      >
        <div class="text-coolGray-500">
          <p>
            <span class="mr-2">&copy; {{ new Date().getFullYear() }}</span>
            <span>{{ $t('institutional.allRightsReserved') }}</span>
          </p>
        </div>

        <div class="flex flex-col sm:flex-row items-center gap-8">
          <div class="space-x-4">
            <NuxtLink target="_blank" :to="{ name: MainPage.Terms }">
              {{ $t('terms.termsAndCondition') }}
            </NuxtLink>
            <a href="https://injectivelabs.org/privacy" target="_blank">
              {{ $t('institutional.privacyPolicy') }}
            </a>
          </div>

          <div class="flex items-center space-x-4">
            <a
              v-for="link in socialLinks"
              :key="link.link"
              class="text-coolGray-900 bg-coolGray-600 p-2.5 rounded-full hover:bg-white leading-4"
              :href="link.link"
              target="_blank"
            >
              <UIcon :name="link.icon" class="size-4" />
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
