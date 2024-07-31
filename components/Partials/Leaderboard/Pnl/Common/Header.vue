<template>
  <PartialsLeaderboardPnlCommonRowWrapper>
    <template #column1>
      <div class="-ml-3 md:ml-0">
        {{ $t('leaderboard.header.rank') }}
      </div>
    </template>

    <template #column2>
      {{ $t('leaderboard.header.address') }}
    </template>

    <template #column3>
      {{ $t('leaderboard.header.tradingPnl') }}
    </template>
  </PartialsLeaderboardPnlCommonRowWrapper>
</template>
