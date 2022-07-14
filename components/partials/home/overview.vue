<template>
  <div>
    <div class="grid grid-cols-4 md:grid-cols-8 xl:grid-cols-12 gap-4 lg:gap-6">
      <ResourceCard
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
      </ResourceCard>
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
          category: 'Rewards',
          title: 'Injective Rewards',
          link: 'https://injective.exchange/trade-and-earn',
          description:
            'Earn rewards with every trade via the $120 Million Injective Astro program.',
          linkText: 'Trade and Earn',
          illustration: '/svg/astro-1.svg',
          imageClass:
            'w-24 h-24 md:w-24 md:h-24 md:mt-4 lg:w-32 lg:h-32 lg:mt-0 xl:w-28 xl:h-28 xl:mt-0'
        },
        {
          category: 'External Link',
          title: 'Injective Hub',
          link: 'https://hub.injective.network',
          description:
            'A unified interface for Injective staking, governance, insurance funds and wallets.',
          linkText: 'Visit the Injective Hub',
          illustration: '/svg/astro-2.svg',
          imageClass:
            'w-32 h-32 -mt-5 md:w-24 md:h-24 md:mt-4 lg:w-32 lg:h-32 lg:mt-0 xl:-mt-2 2xl:w-36 2xl:h-36 2xl:-mt-3'
        },
        {
          category: 'Docs',
          title: 'Injective API',
          link: 'https://api.injective.exchange/',
          description: 'An institutional grade API custom made for Injective.',
          linkText: 'Explore the docs',
          illustration: '/svg/astro-3.svg',
          imageClass:
            'w-24 h-24 -mt-2 md:w-32 md:h-32 md:-mt-2 lg:w-32 lg:h-32 lg:-mt-2 xl:w-28 xl:h-28 xl:-mt-2'
        }
      ]
    }
  }
})
</script>
