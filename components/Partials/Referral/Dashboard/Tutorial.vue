<script lang="ts" setup>
const { t } = useLang()

const tutorialSteps = computed(() => [
  {
    num: '01',
    title: t('referral.referFriends.step1Title'),
    image_url: '/images/referral/refer-friend1.webp',
    description: t('referral.referFriends.step1Description')
  },
  {
    num: '02',
    title: t('referral.referFriends.step2Title'),
    image_url: '/images/referral/refer-friend2.webp',
    description: t('referral.referFriends.step2Description')
  },
  {
    num: '03',
    title: t('referral.referFriends.step3Title'),
    image_url: '/images/referral/refer-friend3.webp',
    description: t('referral.referFriends.step3Description')
  }
])
</script>

<template>
  <div
    class="p-9 bg-brand-825 rounded-lg mt-20 max-sm:mt-8 max-sm:py-8 max-sm:px-6"
  >
    <h5 class="font-bold text-xl leading-none">
      {{ $t('referral.referFriends.title') }}
    </h5>
    <p
      class="tracking-wide text-sm text-coolGray-450 mt-6 mb-4 max-sm:mt-3 max-sm:mb-20"
    >
      {{ $t('referral.referFriends.description1') }}
      <br />
      {{ $t('referral.referFriends.description2') }}
    </p>

    <div class="flex gap-8 max-lg:flex-col">
      <div
        v-for="step in tutorialSteps"
        :key="step.num"
        class="relative lg:flex-1 h-32"
      >
        <span
          class="block w-16 h-16 rounded-full bg-azure-blue-700 absolute z-[1] top-4 left-8"
        />

        <div
          class="relative z-[2] backdrop-blur-[50px] shadow-[0_4px_16px_rgba(0,0,0,0.1)] bg-coolGray-500/5 py-4 px-6 h-full rounded-lg"
        >
          <h6
            class="text-xs font-semibold uppercase tracking-wider leading-none"
          >
            {{ step.title }}
          </h6>
          <p class="mt-2 text-[10px] max-w-44">
            {{ step.description }}
          </p>

          <p class="text-3xl font-semibold absolute left-6 bottom-3">
            {{ step.num }}
          </p>
          <img
            :src="step.image_url"
            class="absolute right-3.5 bottom-3.5"
            :class="[step.num === '03' ? 'w-[76px]' : 'w-14']"
          />
        </div>
      </div>
    </div>
  </div>
</template>
