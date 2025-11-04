<script lang="ts" setup>
const pointsStore = usePointsStore()

withDefaults(
  defineProps<{
    totalPoints?: string
  }>(),
  { totalPoints: '0' }
)

const rank = computed(() => pointsStore.accountPoints?.rank || '0')
</script>

<template>
  <section
    class="my-8 flex gap-12 justify-between max-lg:flex-col max-lg:gap-8"
  >
    <div class="flex flex-col max-sm:gap-2 flex-1 bg-brand-925 rounded-2xl p-6">
      <h4 class="text-coolGray-375 text-[22px] max-sm:text-lg">
        {{ $t('points.totalPoints') }}
      </h4>
      <p class="text-3xl max-sm:text-2xl">
        <SharedAmount
          v-bind="{
            useSubscript: true,
            amount: totalPoints,
            showZeroAsEmDash: true,
            shouldAbbreviate: false
          }"
        />
      </p>
    </div>

    <div class="flex flex-col max-sm:gap-2 flex-1 bg-brand-925 rounded-2xl p-6">
      <h4 class="text-coolGray-375 text-[22px] max-sm:text-lg">
        {{ $t('points.rank') }}
      </h4>
      <p class="text-3xl max-sm:text-2xl">
        <SharedAmount
          v-bind="{
            amount: rank,
            useSubscript: true,
            showZeroAsEmDash: true,
            shouldAbbreviate: false
          }"
        />
      </p>
    </div>

    <template v-if="pointsStore.accountPoints">
      <div
        class="flex flex-col max-sm:gap-2 flex-1 bg-brand-925 rounded-2xl p-6"
      >
        <h4 class="text-coolGray-375 text-[22px] max-sm:text-lg">
          {{ $t('points.level') }}
        </h4>
        <p class="text-3xl max-sm:text-2xl">
          {{ $t(`points.leagues.${pointsStore.accountPoints.league}`) }}
        </p>
      </div>
    </template>
  </section>
</template>
