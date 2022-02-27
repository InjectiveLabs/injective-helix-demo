<template>
  <div class="container mb-40 mt-10">
    <div class="w-full mx-auto max-w-xs sm:max-w-md md:max-w-full xl:w-4/5">
      <div
        class="grid grid-cols-3 md:grid-cols-11 2xl:grid-cols-12 font-bold md:gap-8 2xl:gap-20"
      >
        <p
          class="md:col-span-2 text-2xl 3md:text-3xl 3xl:text-4xl tracking-wide"
        >
          {{ $t('home.iAm') }}
        </p>

        <div
          class="col-span-2 md:col-span-4 font-bold text-2xl 3md:text-3xl 3xl:text-4xl tracking-wide mb-6 md:mb-0"
        >
          <p
            class="cursor-pointer mb-4 md:mb-8 md:max-w-4xs 3xl:max-w-2xs"
            :class="{ 'text-gray-500': type !== FilterTypes.NewToCrypto }"
            @click.stop="updateFilterType(FilterTypes.NewToCrypto)"
          >
            {{ $t('home.newToCrypto') }}
          </p>
          <p
            class="cursor-pointer mb-4 md:mb-8"
            :class="{ 'text-gray-500': type !== FilterTypes.ExperienceTrader }"
            @click.stop="updateFilterType(FilterTypes.ExperienceTrader)"
          >
            {{ $t('home.experienceTrader') }}
          </p>
          <p
            class="cursor-pointer"
            :class="{
              'text-gray-500': type !== FilterTypes.InstitutionalTrader
            }"
            @click.stop="updateFilterType(FilterTypes.InstitutionalTrader)"
          >
            {{ $t('home.institutionalTrader') }}
          </p>
        </div>

        <div class="col-span-5">
          <transition mode="out-in" name="fade-right">
            <div :key="type">
              <div class="mb-8">
                <p class="text-xl 3md:text-2xl mb-4">
                  {{ $t(`home.${type}Features.featureOne`) }}
                </p>
                <p class="text-gray-500">
                  {{ $t(`home.${type}Features.featureOneDescription`) }}
                </p>
              </div>
              <div class="mb-8">
                <p class="text-xl 3md:text mb-4">
                  {{ $t(`home.${type}Features.featureTwo`) }}
                </p>
                <p class="text-gray-500">
                  {{ $t(`home.${type}Features.featureTwoDescription`) }}
                </p>
              </div>
              <div>
                <p class="text-xl 3md:text mb-4">
                  {{ $t(`home.${type}Features.featureThree`) }}
                </p>
                <p class="text-gray-500">
                  {{ $t(`home.${type}Features.featureThreeDescription`) }}
                </p>
              </div>
            </div>
          </transition>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

enum FilterTypes {
  NewToCrypto = 'newToCrypto',
  ExperienceTrader = 'experienceTrader',
  InstitutionalTrader = 'institutionalTrader'
}

export default Vue.extend({
  data() {
    return {
      FilterTypes,
      type: FilterTypes.NewToCrypto
    }
  },

  methods: {
    updateFilterType(type: FilterTypes) {
      this.type = type
    }
  }
})
</script>
