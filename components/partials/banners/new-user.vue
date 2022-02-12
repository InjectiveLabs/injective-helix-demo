<template>
  <v-card md>
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
      <div class="flex justify-between">
        <div>
          <span
            class="text-primary-500 text-2xs px-1 py-0.4 bg-primary-500 bg-opacity-10 rounded align-top"
          >
            {{ $t('banners.newUser.subtitle') }}
          </span>
          <p class="font-bold text-lg mb-4">
            {{ $t('banners.newUser.title') }}
          </p>
          <p class="text-sm text-gray-500 max-w-2xs">
            {{ $t('banners.newUser.description') }}
          </p>
        </div>

        <img
          src="/svg/astro-1.svg"
          alt="Injective Rewards"
          class="w-24 h-24 lg:w-28 lg:h-28 lg:mr-5 ml-3 self-center xl:self-end"
        />
      </div>

      <div class="hidden lg:block col-span-2">
        <v-progress-steps :steps="3" :active-step="activeStep" />
        <div class="grid grid-cols-3 mt-3 gap-8 xl:gap-12 2xl:gap-16">
          <div>
            <span class="tracking-wider uppercase text-xs">
              {{ $t('banners.newUser.stepOne') }}
            </span>
            <p class="mt-2 text-sm font-semibold">
              {{ $t('banners.newUser.stepOneDescription') }}
            </p>
          </div>
          <div>
            <span class="tracking-wider uppercase text-xs">
              {{ $t('banners.newUser.stepTwo') }}
            </span>
            <p class="mt-2 text-sm font-semibold">
              {{ $t('banners.newUser.stepTwoDescription') }}
            </p>
          </div>
          <div>
            <span class="tracking-wider uppercase text-xs">
              {{ $t('banners.newUser.stepThree') }}
            </span>
            <v-button
              lg
              primary
              :disabled="activeStep !== 3"
              class="block w-56 mt-3"
            >
              <span class="font-bold">
                {{ $t('banners.newUser.claimRebate') }}
              </span>
            </v-button>
          </div>
        </div>
      </div>

      <div class="lg:hidden sm:max-w-xs sm:mx-auto h-full mt-8 sm:mt-0">
        <p class="text-xs tracking-wide uppercase mb-4">
          {{ $t('banners.newUser.stepList', { step: mobileStep }) }}
        </p>
        <transition
          mode="out-in"
          :name="slideLeft ? 'fade-left' : 'fade-right'"
        >
          <p
            v-if="mobileStep === 1"
            key="newUserMobileOne"
            class="text-sm font-semibold max-w-xs"
          >
            {{ $t('banners.newUser.stepOneDescription') }}
          </p>
          <p
            v-else-if="mobileStep === 2"
            key="newUserMobileTwo"
            class="text-sm font-semibold max-w-xs"
          >
            {{ $t('banners.newUser.stepTwoDescription') }}
          </p>
          <p
            v-else
            key="newUserMobileThree"
            class="text-sm font-semibold max-w-xs"
          >
            <v-button
              lg
              primary
              class="block w-80"
              :disabled="activeStep !== 3"
            >
              <span class="font-bold">
                {{ $t('banners.newUser.claimRebate') }}
              </span>
            </v-button>
          </p>
        </transition>

        <v-bar-steps
          class="mt-4 max-w-xs mx-auto"
          :steps="3"
          :active-step="mobileStep"
          @change="handleMobileStepChange"
        />
      </div>
    </div>
  </v-card>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  data() {
    return {
      activeStep: 0,
      mobileStep: 1,
      slideLeft: false
    }
  },

  methods: {
    handleMobileStepChange(step: number) {
      this.slideLeft = step < this.mobileStep

      this.mobileStep = step
    }
  }
})
</script>
