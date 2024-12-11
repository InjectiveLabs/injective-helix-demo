<script lang="ts" setup>
const preventFunction = (e: Event) => e.preventDefault()

const scrolling = reactive({
  enabled: true,
  events: ['scroll', 'wheel', 'touchmove', 'pointermove'],

  disable() {
    if (this.enabled) {
      this.enabled = false
      window.addEventListener('scroll', gsap.ticker.tick, { passive: true })
      this.events.forEach((e) => {
        const target = e === 'scroll' ? window : document
        target.addEventListener(e, preventFunction, { passive: false })
      })
    }
  },
  enable() {
    if (!this.enabled) {
      this.enabled = true
      window.removeEventListener('scroll', gsap.ticker.tick)
      this.events.forEach((e) => {
        const target = e === 'scroll' ? window : document
        target.removeEventListener(e, preventFunction)
      })
    }
  }
})

const scrollTriggers = ref<ReturnType<typeof ScrollTrigger.create>[]>([])

onMounted(() => {
  const mm = gsap.matchMedia()

  mm.add('(min-width: 1024px)', () => {
    const sections = document.querySelectorAll('.gsap-section')

    function goToSection(section: Element) {
      if (scrolling.enabled) {
        scrolling.disable()
        gsap.to(window, {
          scrollTo: { y: section, autoKill: false },
          onComplete: () => scrolling.enable(),
          duration: 1.2
        })
      }
    }

    sections.forEach((section) => {
      const trigger = ScrollTrigger.create({
        trigger: section,
        start: 'top bottom-=1',
        end: 'bottom top+=1',
        onEnter: () => goToSection(section),
        onEnterBack: () => goToSection(section)
      })

      scrollTriggers.value.push(trigger)
    })

    return () => {
      scrolling.enable()
      scrollTriggers.value.forEach((trigger) => trigger.kill())
      scrollTriggers.value = []
    }
  })
})

onUnmounted(() => {
  scrolling.enable()
  scrollTriggers.value.forEach((trigger) => trigger.kill())
  scrollTriggers.value = []
})
</script>

<template>
  <div>
    <PartialsHomeGradientBg />
    <AssetNoticeBanners class="relative z-[2]" />
    <!-- hide for launch -->
    <!-- <AssetKadoBanner /> -->

    <div class="max-w-7xl mx-auto w-full px-6 xs:px-8 lg:px-12 relative z-[3]">
      <PartialsHomeSectionsHero />
      <PartialsHomeSectionsBuiltForTheComunity />

      <!-- <PartialsHomeSectionsGettingStarted class="mb-16" /> -->

      <PartialsHomeSectionsOverview />
      <div class="gsap-section lg:h-screen grid place-items-center">
        <div>
          <PartialsHomeAnnouncements />
          <PartialsHomeNewsletter />
        </div>
      </div>
    </div>
  </div>
</template>
