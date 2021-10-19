<template>
  <div>
    <div class="w-full xl:w-2/3">
      <h3 class="text-xl font-bold text-gray-200">
        {{ $t('injective_home_title_2') }}
      </h3>
      <p class="mt-2 text-sm text-gray-400">
        {{ $t('injective_home_subtitle_2') }}
      </p>
    </div>

    <div class="w-full">
      <div class="grid grid-cols-2 md:grid-cols-10 gap-4 md:gap-6 mt-6">
        <v-social-item
          class="col-span-2 md:col-span-2"
          link="https://discord.com/invite/NK4qdbv"
        >
          <span class=""> Join the Injective Community on Discord. </span>
          <template slot="title">
            {{ $t('Discord') }}
          </template>
          <template slot="icon">
            <v-icon-discord class="w-8 h-8 mr-1" />
          </template>
        </v-social-item>
        <v-social-item
          class="col-span-2 md:col-span-2"
          link="https://twitter.com/InjectiveLabs"
        >
          <span class=""> Follow the latest news on Injective </span>
          <template slot="title">
            {{ $t('Twitter') }}
          </template>
          <template slot="icon">
            <v-icon-twitter class="w-8 h-8" />
          </template>
        </v-social-item>
        <v-social-item
          class="col-span-2 md:col-span-2"
          link="https://t.me/joininjective"
        >
          <span class="">Join the Injective Community on Telegram</span>
          <template slot="title">
            {{ $t('Telegram') }}
          </template>
          <template slot="icon">
            <v-icon-telegram class="w-8 h-8 mr-1" />
          </template>
        </v-social-item>
        <v-social-item
          class="col-span-2 md:col-span-2"
          link="https://www.youtube.com/channel/UCN99m0dicoMjNmJV9mxioqQ"
        >
          <span class="">Watch exclusive Injective content</span>
          <template slot="title">
            {{ $t('Youtube') }}
          </template>
          <template slot="icon">
            <v-icon-youtube class="w-8 h-8" />
          </template>
        </v-social-item>
        <v-social-item
          class="col-span-2 md:col-span-2"
          link="https://www.reddit.com/r/injective/"
        >
          <span class="">Join Injective enthusiasts</span>
          <template slot="title">
            {{ $t('Reddit') }}
          </template>
          <template slot="icon">
            <v-icon-reddit class="w-8 h-8" />
          </template>
        </v-social-item>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import VSocialItem from '~/components/partials/home/social-item.vue'

export default Vue.extend({
  components: {
    VSocialItem
  }
})
</script>
