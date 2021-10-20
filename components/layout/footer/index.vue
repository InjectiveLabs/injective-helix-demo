<template>
  <footer
    class="h-full lg:h-footer w-full shadow-md flex flex-wrap lg:justify-between border-t"
  >
    <div
      class="flex flex-col sm:flex-row sm:ml-5 w-full lg:w-auto justify-between sm:justify-around lg:justify-start items-center"
    >
      <item class="lg:ml-6 xl:ml-7 text-xs h-auto sm:h-full">
        <span>&copy; {{ new Date().getFullYear() }} Open DeFi Foundation</span>
      </item>
    </div>
    <ul
      class="list-footer justify-center flex lg:justify-end flex-wrap lg:flex-no-wrap h-full w-full lg:w-auto"
    >
      <item>
        <div class="flex">
          <a href="https://twitter.com/InjectiveLabs" class="mr-4">
            <v-icon-twitter class="w-4 h-4" />
          </a>
          <a
            href="https://www.reddit.com/r/injective/"
            target="_blank"
            class="mr-4"
          >
            <v-icon-reddit class="w-4 h-4" />
          </a>
          <a href="https://discord.gg/injective" target="_blank" class="mr-4">
            <v-icon-discord class="w-4 h-4" />
          </a>
          <a href="https://t.me/joininjective" target="_blank">
            <v-icon-telegram class="w-4 h-4" />
          </a>
        </div>
      </item>
      <item class="text-footer">
        <a
          class="cursor-pointer"
          href="https://injectivelabs.org/privacy-policy"
          target="_blank"
        >
          Privacy Policy
        </a>
      </item>
      <item class="text-footer">
        <a
          class="cursor-pointer"
          href="https://injectivelabs.org/terms-and-conditions"
          target="_blank"
        >
          Terms & Conditions
        </a>
      </item>
    </ul>
  </footer>
</template>

<script lang="ts">
import Vue from 'vue'
import Item from './item.vue'

export default Vue.extend({
  components: {
    Item
  },

  methods: {
    goHome() {
      this.$router.push({ name: 'index' })
    }
  }
})
</script>
