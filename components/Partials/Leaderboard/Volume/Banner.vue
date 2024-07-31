<template>
  <div
    class="custom-gradient-bg rounded-lg h-80 mb-10 relative overflow-hidden pt-12 pl-10"
  >
    <div class="max-w-lg 2xl:max-w-xl flex flex-col space-y-6 items-start">
      <div
        class="text-left text-5xl font-black italic text-gray-1100 leading-14"
      >
        {{ $t('leaderboard.volume.banner.title') }}
      </div>

      <div class="text-left text-base leading-5 text-gray-1100">
        {{ $t('leaderboard.volume.banner.description') }}
      </div>
    </div>
    <img
      src="/images/leaderboard/banner.webp"
      class="h-80 rounded-r-[4px] absolute right-0 object-contain top-0"
    />
  </div>
</template>

<style scoped>
.custom-gradient-bg {
  background: linear-gradient(180deg, #bccbd2 0%, #7c858d 107.61%);
}
</style>
