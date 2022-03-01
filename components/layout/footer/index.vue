<template>
  <footer class="h-full py-16 border-t border-gray-700">
    <div
      class="w-full mx-auto lg:w-4/5 grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 3md:grid-cols-10 lg:grid-cols-12 gap-8 px-8 lg:px-0"
    >
      <div class="sm:col-span-1 xs:col-span-2 3md:col-span-3 lg:col-span-5">
        <div
          class="flex items-center cursor-pointer mb-8"
          @click="$router.push({ name: 'index' })"
        >
          <v-logo id="bbb" key="bbb" class="h-8 w-8 mr-2" alt="InjectivePro" />
          <div class="text-white flex items-center">
            <v-logo-text class="w-24 mr-4" />
            <p class="uppercase flex">
              <span>p</span>
              <span class="mx-1">r</span>
              <span>o</span>
            </p>
          </div>
        </div>

        <span class="text-gray-500 text-xs">
          &copy; {{ new Date().getFullYear() }} Injective Labs Inc.
        </span>
      </div>

      <div class="3md:col-span-2">
        <h3 class="font-bold text-lg mb-2">{{ $t('footer.resources') }}</h3>

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
        <h3 class="font-bold text-lg mb-2">{{ $t('footer.support') }}</h3>

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
        <h3 class="font-bold text-lg mb-6">{{ $t('footer.community') }}</h3>

        <div class="flex items-center">
          <a
            class="w-6 h-6 text-aqua-250 hover:text-primary-500 mr-6"
            href="https://discord.com/invite/injective"
            target="_blank"
          >
            <v-icon-discord-circle />
          </a>

          <a
            class="w-6 h-6 text-aqua-250 hover:text-primary-500 mr-6"
            href="https://twitter.com/InjectiveLabs"
            target="_blank"
          >
            <v-icon-twitter-circle />
          </a>

          <a
            class="w-6 h-6 text-aqua-250 hover:text-primary-500 mr-6"
            href="https://t.me/joininjective"
            target="_blank"
          >
            <v-icon-telegram-circle />
          </a>

          <a
            class="w-6 h-6 text-aqua-250 hover:text-primary-500 mr-6"
            href="https://www.youtube.com/channel/UCN99m0dicoMjNmJV9mxioqQ"
            target="_blank"
          >
            <v-icon-youtube-circle />
          </a>

          <a
            class="w-6 h-6 text-aqua-250 hover:text-primary-500"
            href="https://www.reddit.com/r/injective/"
            target="_blank"
          >
            <v-icon-reddit-circle />
          </a>
        </div>
      </div>
    </div>
  </footer>
</template>

<script lang="ts">
import Vue from 'vue'
import VLogo from '~/components/elements/logo.vue'
import VLogoText from '~/components/elements/logo-text.vue'

export default Vue.extend({
  components: {
    VLogo,
    VLogoText
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
