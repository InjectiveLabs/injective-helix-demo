<script lang="ts" setup>
const { t } = useLang()

const aboutUsList = [
  {
    text: t('footer.feeDiscounts'),
    link: 'fee-discounts'
  },
  {
    text: t('footer.apiDocumentation'),
    link: 'https://api.injective.exchange/'
  },
  {
    text: t('footer.privacyPolicy'),
    link: 'https://injectivelabs.org/privacy-policy'
  },
  {
    text: t('footer.termsAndConditions'),
    link: 'https://injectivelabs.org/terms-and-conditions'
  }
]

const learnList = [
  {
    text: t('footer.faq'),
    link: 'https://helixapp.zendesk.com/'
  }
]
</script>

<template>
  <footer class="w-full py-16 bg-gray-1000 border-t border-t-gray-900">
    <div
      class="w-full mx-auto lg:w-4/5 grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 3md:grid-cols-10 lg:grid-cols-12 gap-8 px-8 lg:px-0"
    >
      <div class="sm:col-span-1 xs:col-span-2 3md:col-span-3 lg:col-span-5">
        <NuxtLink :to="{ name: 'index' }">
          <div class="flex items-center cursor-pointer md:mb-6">
            <AssetLogo class="h-10 w-10 mr-2" alt="Helix" />
            <AssetLogoText class="h-6 md:h-8" />
          </div>
        </NuxtLink>

        <span class="text-gray-500 text-xs">
          &copy; {{ new Date().getFullYear() }} Injective Labs Inc.
        </span>
        <div
          class="hidden text-sm opacity-75 lg:block mt-6 italic max-w-[450px]"
        >
          {{ $t('footer.helixProvides') }}
        </div>
      </div>

      <div class="3md:col-span-2">
        <h3 class="font-bold text-lg mb-4">{{ $t('footer.resources') }}</h3>

        <div
          v-for="(item, index) in aboutUsList"
          :key="`about-us-list-${index}`"
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
          v-for="(item, index) in learnList"
          :key="`about-us-list-${index}`"
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
            class="w-6 h-6 text-gray-500 hover:text-blue-500 mr-4"
            href="https://discord.com/invite/injective"
            target="_blank"
          >
            <BaseIcon name="discord-circle" />
          </a>

          <a
            class="w-6 h-6 text-gray-500 hover:text-blue-500 mr-4"
            href="https://twitter.com/helixapp_"
            target="_blank"
          >
            <BaseIcon name="twitter-circle" />
          </a>

          <a
            class="w-6 h-6 text-gray-500 hover:text-blue-500 mr-4"
            href="https://t.me/helixapp"
            target="_blank"
          >
            <BaseIcon name="telegram-circle" />
          </a>
        </div>
      </div>

      <div class="xs:col-span-2 sm:col-span-3 md:col-span-5 lg:hidden text-sm">
        {{ $t('footer.helixProvides') }}
      </div>
    </div>
  </footer>
</template>
