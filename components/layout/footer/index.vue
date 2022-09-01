<template>
  <footer class="h-full py-16 bg-gray-900">
    <div
      class="w-full mx-auto lg:w-4/5 grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 3md:grid-cols-10 lg:grid-cols-12 gap-8 px-8 lg:px-0"
    >
      <div class="sm:col-span-1 xs:col-span-2 3md:col-span-3 lg:col-span-5">
        <div
          class="flex items-center cursor-pointer md:mb-6"
          @click="$router.push({ name: 'index' })"
        >
          <Logo class="h-10 w-10 mr-2" alt="Helix" />
          <LogoText class="h-6 md:h-8" />
        </div>

        <span class="text-gray-500 text-xs">
          &copy; {{ new Date().getFullYear() }} Injective Labs Inc.
        </span>
        <div class="hidden lg:block mt-12 text-sm max-w-[450px]">
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
            class="cursor-pointer hover:text-primary-500"
            target="_blank"
          >
            {{ item.text }}
          </a>
          <nuxt-link
            v-else-if="item.link"
            :to="{ name: item.link }"
            class="cursor-pointer hover:text-primary-500"
          >
            {{ item.text }}
          </nuxt-link>
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
            class="cursor-pointer hover:text-primary-500"
            target="_blank"
          >
            {{ item.text }}
          </a>
          <nuxt-link
            v-else-if="item.link"
            :to="{ name: item.link }"
            class="cursor-pointer hover:text-primary-500"
          >
            {{ item.text }}
          </nuxt-link>
        </div>
      </div>

      <div class="md:col-span-3">
        <h3 class="font-bold text-lg mb-4 md:mb-6">
          {{ $t('footer.community') }}
        </h3>

        <div class="flex items-center">
          <a
            class="w-6 h-6 text-gray-500 hover:text-primary-500 mr-4"
            href="https://discord.com/invite/injective"
            target="_blank"
          >
            <IconDiscordCircle />
          </a>

          <a
            class="w-6 h-6 text-gray-500 hover:text-primary-500 mr-4"
            href="https://twitter.com/HelixApp_"
            target="_blank"
          >
            <IconTwitterCircle />
          </a>

          <a
            class="w-6 h-6 text-gray-500 hover:text-primary-500 mr-4"
            href="https://t.me/helixapp"
            target="_blank"
          >
            <IconTelegramCircle />
          </a>

          <a
            class="w-6 h-6 text-gray-500 hover:text-primary-500 mr-4"
            href="https://www.youtube.com/channel/UCN99m0dicoMjNmJV9mxioqQ"
            target="_blank"
          >
            <IconYoutubeCircle />
          </a>

          <a
            class="w-6 h-6 text-gray-500 hover:text-primary-500"
            href="https://www.reddit.com/r/injective/"
            target="_blank"
          >
            <IconRedditCircle />
          </a>
        </div>
      </div>

      <div class="xs:col-span-2 sm:col-span-3 md:col-span-5 lg:hidden text-sm">
        {{ $t('footer.helixProvides') }}
      </div>
    </div>
  </footer>
</template>

<script lang="ts">
import Vue from 'vue'
import Logo from '~/components/elements/logo.vue'
import LogoText from '~/components/elements/logo-text.vue'

export default Vue.extend({
  components: {
    Logo,
    LogoText
  },

  data() {
    return {
      aboutUsList: [
        {
          text: this.$t('footer.feeDiscounts'),
          link: 'fee-discounts'
        },
        {
          text: this.$t('footer.apiDocumentation'),
          link: 'https://api.injective.exchange/'
        },
        {
          text: this.$t('footer.analytics'),
          link: 'https://info.injective.exchange/'
        },
        {
          text: this.$t('footer.privacyPolicy'),
          link: 'https://injectivelabs.org/privacy-policy'
        },
        {
          text: this.$t('footer.termsAndConditions'),
          link: 'https://injectivelabs.org/terms-and-conditions'
        }
      ],
      learnList: [
        {
          text: this.$t('footer.faq'),
          link: 'faq'
        },
        {
          text: this.$t('footer.submitRequest'),
          link: 'https://injectivepro.zendesk.com/hc/en-us/requests/new'
        }
      ]
    }
  }
})
</script>
