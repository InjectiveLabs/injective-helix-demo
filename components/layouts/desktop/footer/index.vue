<template>
  <footer
    class="
      h-full
      lg:h-footer
      w-full
      shadow-md
      flex flex-wrap
      lg:justify-between
      border-t
    "
  >
    <div class="ml-5 flex">
      <light-logo style="height: 3.5rem; margin-top: -2px" />
      <item class="ml-10 text-xs">
        <span>&copy; {{ new Date().getFullYear() }} Injective Protocol</span>
      </item>
    </div>
    <ul
      class="
        list-footer
        justify-start
        flex
        lg:justify-end
        flex-wrap
        lg:flex-no-wrap
        h-full
      "
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
            class="
              flex
              items-center
              absolute
              bottom-0
              z-10
              bg-dark-600
              w-24
              p-2
              rounded-lg
              shadow-dimmed
              text-center
            "
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
        <a href="https://docs.injectiveprotocol.com/">Docs</a>
      </item>
      <item class="text-footer">
        <a
          class="cursor-pointer"
          href="https://injectiveprotocol.com/privacy-policy"
          target="_blank"
          >Privacy Policy</a
        >
      </item>
      <item class="text-footer">
        <a
          class="cursor-pointer"
          href="https://injectiveprotocol.com/terms-and-conditions"
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
import { localStorage } from '~/app/singletons/Storage'
import { locales, Locale } from '~/locales'
import LightLogo from '~/components/layouts/light-logo.vue'
import { Icon } from '~/types'

export default Vue.extend({
  directives: {
    onClickaway
  },

  components: {
    Item,
    LightLogo
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
