<script lang="ts" setup>
const scrolling = {
  enabled: true,
  events: 'scroll,wheel,touchmove,pointermove'.split(','),
  prevent: (e: Event) => e.preventDefault(),
  disable() {
    if (scrolling.enabled) {
      scrolling.enabled = false
      window.addEventListener('scroll', gsap.ticker.tick, { passive: true })
      scrolling.events.forEach((e, i) =>
        (i ? document : window).addEventListener(e, scrolling.prevent, {
          passive: false
        })
      )
    }
  },
  enable() {
    if (!scrolling.enabled) {
      scrolling.enabled = true
      window.removeEventListener('scroll', gsap.ticker.tick)
      scrolling.events.forEach((e, i) =>
        (i ? document : window).removeEventListener(e, scrolling.prevent)
      )
    }
  }
}

let isInitialScroll = true

onMounted(() => {
  const mm = gsap.matchMedia()

  mm.add('(min-width: 1024px)', () => {
    const sections = document.querySelectorAll('.gsap-section')

    function goToSection(section: Element) {
      if (scrolling.enabled) {
        // skip if a scroll tween is in progress
        scrolling.disable()
        gsap.to(window, {
          scrollTo: { y: section, autoKill: false },
          onComplete: () => {
            if (isInitialScroll) {
              isInitialScroll = false
              scrolling.enable()
              return
            }

            setTimeout(() => {
              scrolling.enable()
            }, 500)
          },
          duration: 1.2
          // ease: 'power1.out'
        })
      }
    }

    sections.forEach((section) => {
      ScrollTrigger.create({
        trigger: section,
        start: 'top bottom-=1',
        end: 'bottom top+=1',
        onEnter: () => goToSection(section),
        onEnterBack: () => goToSection(section)
      })
    })

    return () => {
      scrolling.enable()
    }
  })
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
      <PartialsHomeAnnouncements />
      <PartialsHomeNewsletter />
    </div>
  </div>
</template>
