<template>
  <div>
    <PartialsLeaderboardPnlCommonTableWrapper class="text-[11px]">
      <PartialsLeaderboardPnlCommonHeader />
    </PartialsLeaderboardPnlCommonTableWrapper>

    <PartialsLeaderboardPnlCommonTableWrapper
      class="text-sm my-1 items-center text-white"
    >
      <PartialsLeaderboardPnlCommonRow v-bind="$attrs" />
    </PartialsLeaderboardPnlCommonTableWrapper>
  </div>
</template>
