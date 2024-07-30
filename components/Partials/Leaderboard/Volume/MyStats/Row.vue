<script lang="ts">
export default {
  inheritAttrs: false
}
</script>
<template>
  <div>
    <PartialsLeaderboardVolumeCommonTableWrapper class="text-[11px]">
      <PartialsLeaderboardVolumeCommonHeader />
    </PartialsLeaderboardVolumeCommonTableWrapper>

    <PartialsLeaderboardVolumeCommonTableWrapper
      class="text-sm my-1 items-center text-white"
    >
      <PartialsLeaderboardVolumeCommonRow v-bind="$attrs" />
    </PartialsLeaderboardVolumeCommonTableWrapper>
  </div>
</template>
