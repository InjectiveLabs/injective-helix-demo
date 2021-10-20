<template>
  <div>
    <h3 class="text-xl font-bold text-gray-200">
      {{ $t('getting_started') }}
    </h3>
    <div class="grid grid-cols-4 md:grid-cols-12 gap-4 lg:gap-6 mt-6">
      <v-home-card
        v-for="(card, index) in cards"
        :key="`home-card-${index}`"
        class="col-span-4"
      >
        <template slot="category">{{ card.category }}</template>
        <template slot="title">{{ card.title }}</template>
        <template slot="illustration">
          <img
            :src="card.illustration"
            :alt="card.title"
            class="mr-4"
            :class="{
              'w-40 h-40 mt-8': index === 0,
              'w-44 h-44 mt-8': index === 1,
              'w-32 h-32 mt-14': index === 2
            }"
          />
        </template>
        <a
          slot="link"
          :href="card.link"
          class="text-primary-500 hover:text-primary-600"
          target="_blank"
        >
          {{ card.linkText }}
        </a>
        {{ card.description }}
      </v-home-card>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import VHomeCard from './card.vue'

export default Vue.extend({
  components: {
    VHomeCard
  },

  data() {
    return {
      cards: [
        {
          category: 'External Link',
          title: 'Injective Hub',
          link: 'https://hub.injective.network',
          description:
            'A unified interface for Injective staking, governance, insurance funds and wallets.',
          linkText: 'Visit our Hub',
          illustration: '/svg/hub-new.svg'
        },
        {
          category: 'Docs',
          title: 'Injective API',
          link: 'https://api.injective.exchange/',
          description: 'An institutional grade API custom made for Injective.',
          linkText: 'Explore the docs',
          illustration: '/svg/api-v1.svg'
        },
        {
          category: 'External Link',
          title: 'The Ecosystem',
          link: 'https://injectiveprotocol.com/ecosystem',
          description:
            'Injective has one of the fastest growing DeFi ecosystems in the world.',
          linkText: 'Join Injective',
          illustration: '/svg/ecosystem-v1.svg'
        }
      ]
    }
  }
})
</script>
