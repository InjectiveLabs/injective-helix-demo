<template>
  <div>
    <div class="hidden md:block">
      <PartialsLeaderboardPnlCommonHeader class="text-[11px]" />

      <PartialsLeaderboardPnlCommonRow
        v-bind="$attrs"
        class="text-sm my-1 items-center text-white"
      />
    </div>

    <div class="md:hidden">
      <PartialsLeaderboardPnlMyStatsMobileRow v-bind="$attrs" />
    </div>
  </div>
</template>
