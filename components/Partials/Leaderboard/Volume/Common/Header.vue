<template>
  <PartialsLeaderboardVolumeCommonRowWrapper>
    <template #column1>
      {{ $t('leaderboard.header.rank') }}
    </template>

    <template #column2>
      {{ $t('leaderboard.header.address') }}
    </template>

    <template #column3>
      <span>
        <span class="hidden md:block">
          {{ $t('leaderboard.header.allMarkestVolume') }}
        </span>
        <span class="md:hidden">
          {{ $t('leaderboard.header.volume') }}
        </span>
      </span>
    </template>

    <template #column4>
      <div class="mr-2">
        <span class="hidden xl:block">
          {{ $t('leaderboard.header.numberOfEntries') }}
        </span>
        <span class="xl:hidden">
          {{ $t('leaderboard.header.entries') }}
        </span>
      </div>
    </template>
  </PartialsLeaderboardVolumeCommonRowWrapper>
</template>
