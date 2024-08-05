<script lang="ts">
export default {
  inheritAttrs: false
}
</script>
<template>
  <div>
    <PartialsLeaderboardCompetitionCommonTableWrapper class="text-[11px]">
      <PartialsLeaderboardCompetitionCommonHeader />
    </PartialsLeaderboardCompetitionCommonTableWrapper>

    <PartialsLeaderboardCompetitionCommonTableWrapper
      class="text-sm my-1 items-center text-white"
    >
      <PartialsLeaderboardCompetitionCommonRow v-bind="$attrs" />
    </PartialsLeaderboardCompetitionCommonTableWrapper>
  </div>
</template>
