<template>
  <!-- eslint-disable vue/no-v-html -->
  <main class="flex flex-col h-screen w-full">
    <div class="container flex flex-col h-full p-4 sm:p-20">
      <div class="flex items-center justify-center mx-auto">
        <Logo class="h-10 w-10 mr-2" alt="Helix" />
        <LogoText class="h-8" />
      </div>

      <div class="h-[calc(100%-20px)] flex flex-col justify-center items-center">
        <h1 class="text-white font-bold text-3xl text-center">
          {{ $t('maintenance_header') }}
        </h1>

        <h2
          class="text-white text-xl text-center my-4 max-w-xl"
          v-html="$t('maintenance_body')"
        />

        <div class="text-center">
          <VButton primary xl class="rounded-full">
            <a
              href="https://status.exchange.injective.network/"
              target="_blank"
            >
              {{ $t('maintenance_button') }}
            </a>
          </VButton>
        </div>
      </div>
    </div>
  </main>
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

  layout: 'blank'
})
</script>
