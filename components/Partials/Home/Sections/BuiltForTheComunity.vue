<script setup lang="ts">
onMounted(() => {
  const mm = gsap.matchMedia()

  mm.add('(min-width: 1024px)', () => {
    gsap.to('#built-for-the-community-text', {
      scrollTrigger: {
        trigger: '#built-for-the-community-text',
        start: 'top 40%',
        end: 'bottom 0%',
        scrub: 1,
        pin: true
      },
      opacity: 1,
      filter: 'blur(0px)'
    })

    gsap.to('#built-for-the-community-image', {
      scrollTrigger: {
        trigger: '#built-for-the-community-image',
        start: 'top 20%',
        end: 'bottom 40%',
        scrub: 2,
        pin: true
      },
      scale: 0.9
    })
  })
})
</script>

<template>
  <div class="relative pb-32">
    <AppBlur
      class="absolute bottom-52 left-1/2 -translate-x-1/2 rotate-45 opacity-15 scale-50 text-blue-500"
    />

    <AppBlur
      class="absolute top-full -translate-y-1/2 left-32 -translate-x-1/2 rotate-45 opacity-15 scale-50 text-blue-500"
    />

    <div id="built-for-the-community-text" class="opacity-0 blur-3xl">
      <h1 class="text-2xl lg:text-5xl font-semibold text-center">
        {{ $t('home.builtForTheCommunity') }}
      </h1>
      <p class="text-lg text-center">
        {{ $t('home.builtForTheCommunityDescription') }}
      </p>
    </div>

    <div class="px-10 mt-20">
      <img
        id="built-for-the-community-image"
        src="/images/home/hero.webp"
        class="w-full h-full border rounded-xl shadow-[0_0_16px_rgba(0,255,0,0.5)] origin-top"
      />
    </div>

    <div class="flex justify-center space-x-20 font-semibold mt-10">
      <div>
        <p class="text-coolGray-400">Total Trades</p>
        <p class="text-2xl">100,000</p>
      </div>
      <div>
        <p class="text-coolGray-400">Total Trades</p>
        <p class="text-2xl">100,000</p>
      </div>
      <div>
        <p class="text-coolGray-400">Total Trades</p>
        <p class="text-2xl">100,000</p>
      </div>
    </div>
  </div>
</template>
