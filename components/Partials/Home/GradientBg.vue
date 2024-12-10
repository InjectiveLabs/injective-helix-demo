<script setup lang="ts">
const ellipses = [
  {
    x: 100,
    y: 100,
    size: 500
  },
  {
    x: 200,
    y: 700,
    size: 300
  },
  {
    x: 800,
    y: 200,
    size: 700
  },
  {
    x: 700,
    y: 300,
    size: 300
  },
  {
    x: 1000,
    y: 1000,
    size: 300
  },
  {
    x: 1500,
    y: 1400,
    size: 300
  }
]

onMounted(() => {
  gsap.utils.toArray('.ellipse').forEach((ellipse) => {
    gsap.set('#gradient-bg', {
      filter: `blur(${Math.random() * 2 + 5}rem)`
    })

    gsap.to(ellipse as HTMLElement, {
      x: Math.random() * 1000 - 500,
      y: Math.random() * 1000 - 500,
      duration: Math.random() * 4 + 5,
      ease: 'none',
      repeat: -1,
      yoyo: true
    })
  })
})
</script>

<template>
  <div id="gradient-bg" class="fixed inset-0 filter opacity-30">
    <div
      v-for="(ellipse, i) in ellipses"
      :id="`ellipse-${i}`"
      :key="i"
      class="absolute ellipse rounded-full"
      :style="{
        width: `${ellipse.size}px`,
        height: `${ellipse.size}px`,
        left: `${ellipse.x}px`,
        top: `${ellipse.y}px`,
        background: `hsl(${Math.random() * 50 - 25 + 190}, 100%, ${
          55 - i * 10
        }%)`
      }"
    ></div>
  </div>
</template>
