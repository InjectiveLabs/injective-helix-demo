<script setup lang="ts">
onMounted(() => {
  const mm = gsap.matchMedia()

  mm.add('(min-width: 1024px)', () => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: '#documentation-content',
        start: () => 'center 60%',
        end: () => '+=700px',
        scrub: 1,
        pin: true,
        pinSpacing: true
      }
    })

    tl.to(
      '#documentation-title',
      {
        opacity: 1,
        filter: 'blur(0px)'
      },
      0
    ).to(
      '#documentation-content',
      {
        scale: 1
      },
      0
    )
  })
})
</script>

<template>
  <div class="relative pt-24 lg:pt-32 lg:pb-40 flex flex-col items-center">
    <div id="documentation-content" class="lg:scale-90">
      <div id="documentation-title" class="lg:opacity-0 lg:blur-3xl">
        <h1 class="text-2xl lg:text-5xl font-semibold text-center">
          {{ $t('home.documentation') }}
        </h1>
      </div>

      <div class="pt-8 flex gap-10 max-sm:flex-col max-sm:max-w-80">
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
            to="https://docs.helixapp.com/"
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
            to="https://api.injective.exchange/#change-log"
            target="_blank"
          >
            {{ $t('home.apiDocs') }}
          </SharedButton>
        </div>
      </div>
    </div>
  </div>
</template>
