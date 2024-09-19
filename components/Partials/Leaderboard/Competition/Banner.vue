<template>
  <div
    class="rounded-lg md:h-64 lg:h-80 mb-10 relative overflow-hidden flex justify-between"
  >
    <div
      class="px-6 xl:px-10 custom-gradient-bg flex flex-col space-y-4 xl:space-y-6 items-start py-6 xl:pt-12 flex-1"
    >
      <div
        class="text-left text-4xl xl:text-5xl font-black italic text-gray-1100 lg:leading-14"
      >
        {{ $t('leaderboard.competition.banner.title') }}
      </div>

      <div
        class="text-left text-sm xl:text-base text-gray-1100 max-w-lg 2xl:max-w-xl"
      >
        <span class="leading-4 xl:leading-5">
          {{ $t('leaderboard.competition.banner.description') }}
        </span>
      </div>

      <div class="text-left text-xs text-gray-1100">
        {{ $t('leaderboard.competition.banner.smallText') }}
      </div>
    </div>

    <img
      src="/images/leaderboard/gwagon.webp"
      class="hidden md:block object-contain max-md:flex-1"
    />
  </div>
</template>

<style scoped>
.custom-gradient-bg {
  background: linear-gradient(180deg, #bccbd2 0%, #7c858d 107.61%);
}
</style>
