<template>
  <div
    class="bg-[#000000] font-inter min-h-screen w-full flex items-center justify-center flex-col"
  >
    <h1 class="text-[32px] xs:text-[40px] font-bold tracking-wide">
      Injective Pro is now
    </h1>
    <div class="flex items-center gap-6 mt-4">
      <HelixLogo class="h-[60px] w-20" />
      <HelixLogoText class="block h-12 text-white" />
    </div>

    <h3 class="text-base leading-5 font-semibold mt-8 mb-8">
      Redirecting to Helixapp.com
      <span v-if="countdownFrom > 0">in {{ countdownFrom }}</span>
      ...
    </h3>

    <a href="https://helixapp.com/">
      <VButton xl class="bg-blue-200 text-white w-60 hover:opacity-60">
        <span class="font-semibold">Go to Helixapp.com</span>
      </VButton>
    </a>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import HelixLogo from '~/components/elements/helix-logo.vue'
import HelixLogoText from '~/components/elements/helix-logo-text.vue'

export default Vue.extend({
  components: {
    HelixLogo,
    HelixLogoText
  },

  data() {
    return {
      countdownFrom: 3
    }
  },

  mounted() {
    this.setIntervalForNow()
    this.redirectPage()
  },

  methods: {
    setIntervalForNow() {
      setInterval(() => {
        this.countdownFrom = this.countdownFrom - 1
      }, 1000)
    },

    redirectPage() {
      setTimeout(() => {
        const link = document.createElement('a')

        link.href = 'https://helixapp.com/'
        document.body.appendChild(link)
        link.click()
      }, this.countdownFrom * 1000)
    }
  }
})
</script>
