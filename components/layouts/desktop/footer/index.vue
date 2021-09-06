<template>
  <footer
    class="h-full lg:h-footer w-full shadow-md flex flex-wrap lg:justify-between border-t"
  >
    <div
      class="flex flex-col sm:flex-row sm:ml-5 w-full lg:w-auto justify-between sm:justify-around lg:justify-start"
    >
      <h1
        class="font-black text-xl uppercase flex justify-center items-center border-r sm:py-2 cursor-pointer"
        @click.stop="goHome"
      >
        <logo class="mr-2 w-8 h-8" />
        <span class="text-white"> {{ $t('injective') }} PRO </span>
      </h1>
      <item class="lg:ml-6 xl:ml-7 text-xs h-auto sm:h-full">
        <span>&copy; {{ new Date().getFullYear() }} Open DeFi Foundation</span>
      </item>
    </div>
    <ul
      class="list-footer justify-center flex lg:justify-end flex-wrap lg:flex-no-wrap h-full w-full lg:w-auto"
    >
      <item>
        <div
          class="cursor-pointer leading-none"
          :class="{ relative: showLocaleDropdown }"
          @click.prevent.stop="onToggleLocaleDropdown"
        >
          <v-ui-icon :icon="Icon.Globe" sm />

          <div
            v-if="showLocaleDropdown"
            v-on-clickaway="onCloseLocaleDropdown"
            class="flex items-center absolute bottom-0 z-10 bg-dark-600 w-24 p-2 rounded-lg shadow-dimmed text-center"
          >
            <a
              v-for="locale in visibleLocales"
              :key="`locale-${locale.name}`"
              class="text-white font-semibold cursor-pointer w-full"
              @click="changeLocale(locale)"
              >{{ locale.name }}</a
            >
          </div>
        </div>
      </item>
      <item>
        <div class="flex">
          <a href="https://twitter.com/InjectiveLabs" class="mr-4">
            <v-ui-icon :icon="Icon.Twitter" sm />
          </a>
          <a
            href="https://www.reddit.com/r/injective/"
            target="_blank"
            class="mr-4"
          >
            <v-ui-icon :icon="Icon.Reddit" sm />
          </a>
          <a href="https://discord.gg/injective" target="_blank" class="mr-4">
            <v-ui-icon :icon="Icon.Discord" sm />
          </a>
          <a href="https://t.me/joininjective" target="_blank">
            <v-ui-icon :icon="Icon.Telegram" sm />
          </a>
        </div>
      </item>
      <item class="text-footer">
        <a
          class="cursor-pointer"
          href="https://injectivelabs.org/privacy-policy"
          target="_blank"
          >Privacy Policy</a
        >
      </item>
      <item class="text-footer">
        <a
          class="cursor-pointer"
          href="https://injectivelabs.org/terms-and-conditions"
          target="_blank"
          >Terms & Conditions</a
        >
      </item>
    </ul>
  </footer>
</template>

<script lang="ts">
import Vue from 'vue'
import { directive as onClickaway } from 'vue-clickaway'
import Item from './item.vue'
import Logo from '~/components/layouts/logo.vue'
import { localStorage } from '~/app/singletons/Storage'
import { locales, Locale } from '~/locales'
import { Icon } from '~/types'

export default Vue.extend({
  directives: {
    onClickaway
  },

  components: {
    Item,
    Logo
  },

  data() {
    return {
      Icon,
      locales,
      showLocaleDropdown: false
    }
  },

  computed: {
    visibleLocales(): Locale[] {
      return this.locales.filter(({ locale }: Locale) => {
        return !this.$i18n.locale.includes(locale)
      })
    }
  },

  methods: {
    goHome() {
      this.$router.push({ name: 'index' })
    },

    onToggleLocaleDropdown() {
      this.showLocaleDropdown = !this.showLocaleDropdown
    },

    onCloseLocaleDropdown() {
      if (this.showLocaleDropdown) {
        this.showLocaleDropdown = false
      }
    },

    changeLocale(locale: Locale) {
      localStorage.set('locale', locale.locale)
      this.$i18n.locale = locale.locale
      this.$accessor.app.setAppLocale(locale)
      this.onCloseLocaleDropdown()
    }
  }
})
</script>
