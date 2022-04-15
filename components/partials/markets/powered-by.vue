<template>
  <div class="flex items-center gap-1 text-gray-500">
    <p class="text-2xs">{{ $t('markets.poweredBy') }}</p>
    <a
      v-tooltip="{ content: 'Burnt Finance' }"
      href="https://www.burnt.com/"
      target="_blank"
    >
      <img
        src="/svg/burnt-finance-gray.svg"
        class="h-3 w-auto"
        alt="Burnt Finance"
      />
    </a>
    <a
      v-tooltip="{ content: 'NFT Bank' }"
      href="https://nftbank.ai/"
      target="_blank"
    >
      <img src="/svg/nft-bank-gray.svg" class="h-3 w-auto" alt="NFT Bank" />
    </a>
  </div>
</template>
