<script setup lang="ts">
import { TradeSubPage } from '@/types'

const { lg } = useSharedBreakpoints()

onMounted(() => {
  const mm = gsap.matchMedia()

  mm.add('(min-width: 1024px)', () => {
    gsap.from('#hero-section', {
      opacity: 0,
      filter: 'blur(10px)',
      duration: 2,
      delay: 0.2,
      scale: 1.2
    })

    gsap.utils.toArray('.gsap-element').forEach((text, _i, arr) => {
      gsap.to(text as HTMLElement, {
        scrollTrigger: {
          trigger: text as HTMLElement,
          start: 'clamp(50px 40%)',
          end: 'clamp(bottom 0%)',
          scrub: 2
        },
        y: arr.length * -40,
        scale: 1.2,
        filter: 'blur(10px)',
        opacity: 0,
        duration: 1
      })
    })
  })
})

function goToWhyHelix() {
  const target = document.querySelector('#overview-section')

  if (target) {
    gsap.to(window, {
      duration: 1,
      scrollTo: { y: target, offsetY: lg.value ? 80 : 40 }
    })
  }
}
</script>

<template>
  <div
    class="lg:h-screen flex flex-col lg:justify-center max-lg:pt-10 relative gsap-section z-30"
  >
    <div
      id="hero-section"
      class="max-w-4xl mx-auto w-full text-center flex flex-col items-center"
    >
      <h1 id="hero-title" class="font-semibold gsap-element mb-10 lg:mb-8">
        <p class="text-4xl lg:text-7xl">
          {{ $t('home.openFinance') + ' ' }}
        </p>
        <p
          class="text-blue-500 text-4xl lg:text-[128px] font-bold lg:leading-none"
        >
          {{ $t('home.reimagined') }}
        </p>
      </h1>

      <p id="hero-description" class="text-lg gsap-element">
        {{ $t('home.description') }}
      </p>

      <div class="flex justify-center gap-4 my-14 lg:my-10 gsap-element">
        <NuxtLink
          :to="{ name: TradeSubPage.Spot, params: { slug: 'inj-usdt' } }"
        >
          <AppButton class="w-full font-semibold">
            {{ $t('home.startTrading') }}
          </AppButton>
        </NuxtLink>

        <AppButton
          class="w-full isolate font-semibold"
          variant="primary-outline"
          @click="goToWhyHelix"
        >
          {{ $t('home.whyHelix') }}
        </AppButton>
      </div>

      <PartialsHomeSectionsHeroMobileQRCode class="gsap-element" />
    </div>
  </div>
</template>
