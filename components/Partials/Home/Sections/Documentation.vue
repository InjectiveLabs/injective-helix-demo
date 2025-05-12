<script setup lang="ts">
// onMounted(() => {
// const mm = gsap.matchMedia()

// mm.add('(min-width: 1024px)', () => {
//   gsap.to('#documentation-title', {
//     scrollTrigger: {
//       trigger: '#documentation-title',
//       start: () => 'top 40%',
//       end: () => 'bottom 0%',
//       scrub: 1,
//       pin: true
//     },
//     opacity: 1,
//     filter: 'blur(0px)'
//   })
//   gsap.to('#documentation-image', {
//     scrollTrigger: {
//       trigger: '#documentation-image',
//       start: () => 'top 20%',
//       end: () => 'bottom 40%',
//       scrub: 2,
//       pin: true
//     },
//     scale: 0.9
//   })
// })
// })
</script>

<template>
  <div class="relative pb-32 flex flex-col items-center">
    <div id="documentation-title">
      <h1 class="text-2xl lg:text-5xl font-semibold text-center">
        {{ $t('home.documentation') }}
      </h1>
    </div>

    <div id="documentation-image" class="pt-8 flex gap-10">
      <div
        class="rounded-2xl border border-[#0B182B] bg-coolGray-800 py-10 px-6 flex flex-col gap-9"
      >
        <img
          src="/images/home/helix-docs.webp"
          class="w-80"
          alt="Helix Documentation"
        />

        <SharedButton
          class="w-full dark:bg-blue-500 py-3 justify-center border border-blue-500 dark:hover:bg-blue-500/70 hover:border-blue-500/70 transition-colors font-semibold"
          to="https://app.gitbook.com/o/LzWvewxXUBLXQT4cTrrj/"
          target="_blank"
        >
          {{ $t('home.helixDocs') }}
        </SharedButton>
      </div>

      <div
        class="rounded-2xl border border-[#0B182B] bg-coolGray-800 py-10 px-6 flex flex-col gap-9 transition-colors"
      >
        <img
          src="/images/home/api-docs.webp"
          class="w-80"
          alt="API Documentation"
        />

        <SharedButton
          variant="outline"
          class="w-full py-3 justify-center dark:text-white font-semibold ring-blue-500"
          to="https://api.injective.exchange/"
          target="_blank"
        >
          {{ $t('home.apiDocs') }}
        </SharedButton>
      </div>
    </div>
  </div>
</template>
