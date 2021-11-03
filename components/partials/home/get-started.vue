<template>
  <div>
    <h3 class="text-xl font-bold text-gray-200">
      {{ $t('getting_started') }}
    </h3>
    <div class="grid grid-cols-4 md:grid-cols-12 gap-4 lg:gap-6 mt-6">
      <v-resource-card
        v-for="(card, index) in cards"
        :key="`resource-card-${index}`"
        class="col-span-4"
      >
        <template slot="category">{{ card.category }}</template>
        <template slot="title">{{ card.title }}</template>
        <template slot="illustration">
          <img
            :src="card.illustration"
            :alt="card.title"
            :class="card.imageClass"
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
      </v-resource-card>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  data() {
    return {
      cards: [
        {
          category: 'External Link',
          title: 'Injective Hub',
          link: 'https://hub.injective.network',
          description:
            'A unified interface for Injective staking, governance, insurance funds and wallets.',
          linkText: 'Visit the Injective Hub',
          illustration: '/svg/hub-new.svg',
          imageClass:
            'w-32 h-32 -mt-5 md:w-24 md:h-24 md:mt-4 lg:w-36 lg:h-36 lg:-mt-5'
        },
        {
          category: 'Docs',
          title: 'Injective API',
          link: 'https://api.injective.exchange/',
          description: 'An institutional grade API custom made for Injective.',
          linkText: 'Explore the docs',
          illustration: '/svg/api-v1.svg',
          imageClass:
            'w-36 h-36 -mt-6 md:w-38 md:h-38 md:-mt-2 lg:w-40 lg:h-40 lg:-mt-8'
        },
        {
          category: 'External Link',
          title: 'The Ecosystem',
          link: 'https://injectiveprotocol.com/ecosystem',
          description:
            'Injective has one of the fastest growing DeFi ecosystems in the world.',
          linkText: 'Join Injective',
          illustration: '/svg/ecosystem-v1.svg',
          imageClass:
            'w-24 h-24 md:w-24 md:h-24 md:mt-4 lg:w-32 lg:h-32 lg:-mt-2'
        }
      ]
    }
  }
})
</script>
