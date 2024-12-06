<script lang="ts" setup>
withDefaults(
  defineProps<{
    rank: string
    league: string
    totalPoints: string
  }>(),
  {}
)
</script>

<template>
  <div
    class="flex mt-[72px] mb-24 max-lg:flex-col max-lg:gap-6 max-xs:mt-14 max-xs:mb-16"
  >
    <div class="flex flex-col gap-1">
      <h4
        class="text-coolGray-450 text-2xl max-xs:text-base max-lg:text-[18px] max-xl:text-xl"
      >
        {{ $t('points.totalPoints') }}
      </h4>
      <p
        class="text-[56px] max-xs:text-5xl max-lg:text-[42px] max-xl:text-5xl tracking-tight font-medium"
      >
        {{ totalPoints }}
      </p>
    </div>

    <span class="w-[1px] bg-[#707883] ml-10 mr-6 max-lg:hidden" />

    <div class="flex flex-col gap-1">
      <h4
        class="text-coolGray-450 text-2xl max-xs:text-base max-lg:text-[18px] max-xl:text-xl"
      >
        {{ $t('points.rank') }}
      </h4>
      <p
        class="text-[56px] max-xs:text-5xl max-lg:text-[42px] max-xl:text-5xl tracking-tight font-medium"
      >
        {{ rank }}
      </p>
    </div>

    <span class="w-[1px] bg-[#707883] ml-20 mr-6 max-lg:hidden" />

    <div class="flex flex-col gap-1">
      <h4
        class="text-coolGray-450 text-2xl max-xs:text-base max-lg:text-[18px] max-xl:text-xl"
      >
        {{ $t('points.league') }}
      </h4>
      <p
        class="text-[56px] max-xs:text-5xl max-lg:text-[42px] max-xl:text-5xl tracking-tight font-medium"
      >
        {{ league }}
      </p>
    </div>
  </div>
</template>
