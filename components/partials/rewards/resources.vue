<template>
  <div>
    <h3 class="text-xl font-bold text-gray-200">
      {{ $t('resources') }}
    </h3>
    <div class="grid grid-cols-4 md:grid-cols-12 gap-4 lg:gap-6 mt-6">
      <v-resource-card
        v-for="(card, index) in cards"
        :key="`resource-card-${index}`"
        class="col-span-4"
      >
        <template slot="category">{{ card.category }}</template>
        <template slot="title">{{ card.title }}</template>
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
          linkText: 'Visit our Hub'
        }
      ]
    }
  }
})
</script>
