<template>
  <div>
    <h2 class="portfolio-title px px-4 pt-4">
      {{ $t('navigation.balances') }}
    </h2>
    <div class="lg:mt-8">
      <PartialsPortfolioBalancesHeader class="p-4" />

      <PartialsPortfolioBalancesSubaccount class="lg:mt-12" />
    </div>
  </div>
</template>
