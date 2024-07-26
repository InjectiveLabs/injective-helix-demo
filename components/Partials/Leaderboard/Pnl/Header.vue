<template>
  <PartialsLeaderboardPnlRowWrapper>
    <template #column1>
      {{ $t('leaderboard.header.rank') }}
    </template>

    <template #column2>
      {{ $t('leaderboard.header.address') }}
    </template>

    <template #column3>
      {{ $t('leaderboard.header.tradingPnl') }}
    </template>
  </PartialsLeaderboardPnlRowWrapper>
</template>
