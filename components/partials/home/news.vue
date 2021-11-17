<template>
  <div>
    <h3 class="text-xl font-bold text-gray-200">
      {{ $t('recent_news') }}
    </h3>
    <div class="flex flex-wrap -mx-4 mt-4">
      <a
        v-for="article in articles"
        :key="article.title"
        :href="article.link"
        target="_blank"
        class="w-full mt-2 md:mt-0 md:w-1/3 text-sm flex items-center text-gray-300 hover:text-gray-200 px-4"
      >
        <v-icon-news class="w-4 h-4 mr-1" />
        {{ article.title }}
        <v-icon-caret-down class="w-4 h-4 transform -rotate-90 ml-1" />
      </a>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  data() {
    return {
      articles: [
        {
          title: 'Injective Astro: A $120 Million Liquidity Incentive Program',
          link:
            'https://blog.injectiveprotocol.com/injective-launches-astro-a-120-million-liquidity-incentive-program/'
        },
        {
          title: 'Injective VIP Fee Discount Program Launch',
          link:
            'https://blog.injectiveprotocol.com/injective-vip-fee-discount-program-launch/'
        },
        {
          title: 'Injective Canonical Chain Mainnet Release',
          link:
            'https://blog.injectiveprotocol.com/injective-canonical-chain-mainnet-release/'
        }
      ]
    }
  }
})
</script>
