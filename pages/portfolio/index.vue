<script setup lang="ts"></script>

<template>
  <div class="p-4">
    <h1 class="portfolio-title">{{ $t('navigation.portfolio') }}</h1>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 p-4">
      <CommonHeadlessTotalBalance>
        <template #default="{ accountTotalBalanceInUsd }">
          <PartialsPortfolioPortfolioBalanceChartWrapper
            v-bind="{ accountTotalBalanceInUsd }"
          />
        </template>
      </CommonHeadlessTotalBalance>
      <PartialsPortfolioPortfolioPnLChartWrapper />

      <PartialsPortfolioPortfolioTradingVolumeChartWrapper />
    </div>
  </div>
</template>
