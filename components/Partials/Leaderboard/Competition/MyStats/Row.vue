<script lang="ts">
export default {
  inheritAttrs: false
}
</script>
<template>
  <div>
    <div class="hidden lg:block">
      <div>
        <PartialsLeaderboardCompetitionCommonHeader class="text-[11px]" />

        <PartialsLeaderboardCompetitionCommonRow
          class="text-sm my-1 items-center text-white"
          v-bind="$attrs"
        />
      </div>
    </div>

    <div class="lg:hidden">
      <PartialsLeaderboardCompetitionMyStatsMobileRow v-bind="$attrs" />
    </div>
  </div>
</template>
