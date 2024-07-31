<template>
  <PartialsLeaderboardVolumeCommonRowWrapper>
    <template #column1>
      <div class="max-lg:-ml-3">
        {{ $t('leaderboard.header.rank') }}
      </div>
    </template>

    <template #column2>
      {{ $t('leaderboard.header.address') }}
    </template>

    <template #column3>
      <span>
        <span class="hidden lg:block">
          {{ $t('leaderboard.header.allMarkestVolume') }}
        </span>
        <span class="lg:hidden"> {{ $t('leaderboard.header.volume') }}/ </span>
      </span>
    </template>

    <template #column4>
      <div class="lg:mr-2">
        <span class="block md:hidden xl:block">
          {{ $t('leaderboard.header.numberOfEntries') }}
        </span>
        <span class="hidden md:block xl:hidden">
          {{ $t('leaderboard.header.entries') }}
        </span>
      </div>
    </template>
  </PartialsLeaderboardVolumeCommonRowWrapper>
</template>
