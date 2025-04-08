<script lang="ts" setup>
import { NuxtUiIcons } from '@shared/types'

const socialLinks = [
  { icon: NuxtUiIcons.Discord, link: 'https://discord.com/invite/helixapp' },
  { icon: NuxtUiIcons.TwitterX, link: 'https://x.com/helixapp_' },
  { icon: NuxtUiIcons.Telegram, link: 'https://t.me/helixapp' },
  { icon: NuxtUiIcons.Youtube, link: 'https://www.youtube.com/@injective_' }
]
</script>

<template>
  <div class="flex flex-col items-center max-sm:items-start">
    <h1 class="text-3xl font-semibold mb-5 leading-none">
      {{ $t('referral.beta.title') }}
    </h1>
    <p class="tracking-wide text-sm max-w-[520px] text-center max-sm:text-left">
      {{ $t('referral.beta.description') }}
    </p>

    <div class="w-full bg-brand-825 rounded-lg p-9 max-sm:px-6 pb-7 mt-8">
      <h5 class="font-bold text-xl">{{ $t('referral.beta.ctaTitle1') }}</h5>
      <p class="tracking-wide text-sm text-coolGray-450 mt-2 mb-6">
        {{ $t('referral.beta.ctaDescription1') }}
      </p>

      <UButton
        class="font-semibold tracking-wide min-w-48 min-h-10 justify-center dark:bg-blue-500 dark:hover:bg-blue-500/70 transition-colors"
        color="primary"
        target="_blank"
        to="https://form.typeform.com/to/z55hclVp"
      >
        {{ $t('referral.joinTheWaitlist') }}
      </UButton>
    </div>

    <div class="w-full bg-brand-825 rounded-lg p-9 max-sm:px-6 pb-7 mt-8">
      <h5 class="font-bold text-xl">{{ $t('referral.beta.ctaTitle2') }}</h5>
      <p class="tracking-wide text-sm text-coolGray-450 mt-2 mb-6">
        {{ $t('referral.beta.ctaDescription2') }}
      </p>

      <div class="flex items-center gap-4">
        <a
          v-for="link in socialLinks"
          :key="link.link"
          :class="[
            link.icon === NuxtUiIcons.Youtube ? 'p-0.5' : 'p-1',
            { 'pr-1.5': link.icon === NuxtUiIcons.Telegram },
            'flex text-coolGray-900 bg-blue-500 rounded-full hover:bg-blue-600'
          ]"
          :href="link.link"
          target="_blank"
        >
          <UIcon
            :name="link.icon"
            class="size-4"
            :class="{ 'size-5': link.icon === NuxtUiIcons.Youtube }"
          />
        </a>
      </div>
    </div>
  </div>
</template>
