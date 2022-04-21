<template>
  <div class="flex items-center gap-1 text-gray-500">
    <p class="text-2xs">{{ $t('markets.poweredBy') }}</p>
    <a
      v-tooltip="{ content: 'Burnt Finance' }"
      href="https://www.burnt.com/"
      target="_blank"
      @click.stop
      @mouseenter="onBurntHover = true"
      @mouseleave="onBurntHover = false"
    >
      <img
        :src="
          onBurntHover
            ? '/svg/burnt-finance.svg'
            : '/svg/burnt-finance-gray.svg'
        "
        class="h-3 w-auto"
        alt="Burnt Finance"
      />
    </a>
    <a
      v-tooltip="{ content: 'NFT Bank' }"
      href="https://nftbank.ai/"
      target="_blank"
      @click.stop
      @mouseenter="onNFTHover = true"
      @mouseleave="onNFTHover = false"
    >
      <img
        :src="onNFTHover ? '/svg/nft-bank.svg' : '/svg/nft-bank-gray.svg'"
        class="h-3 w-auto"
        alt="NFT Bank"
      />
    </a>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  data() {
    return {
      onBurntHover: false,
      onNFTHover: false
    }
  }
})
</script>
