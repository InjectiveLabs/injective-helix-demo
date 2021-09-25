<template>
  <div>
    <h3 class="text-xl font-bold text-gray-200">
      {{ $t('getting_started') }}
    </h3>
    <div class="grid grid-cols-4 lg:grid-cols-12 gap-4 lg:gap-8 mt-6">
      <v-home-card
        v-for="(card, index) in cards"
        :key="`home-card-${index}`"
        class="col-span-4 lg:col-span-6"
      >
        <template slot="category">{{ card.category }}</template>
        <template slot="title">{{ card.title }}</template>
        <a
          slot="link"
          :href="card.link"
          class="text-primary-500 hover:text-primary-600"
          target="_blank"
          >{{ card.linkText }}</a
        >
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
          category: 'TO DO',
          title: 'Introducing INJ',
          link: 'https://hub.injective.exchange',
          description:
            'Tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.',
          linkText: 'Learn more'
        },
        {
          category: 'Injective Hub',
          title: 'Injective Hub',
          link: 'https://hub.injective.exchange',
          description:
            'Tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.',
          linkText: 'Learn more'
        }
      ]
    }
  }
})
</script>
