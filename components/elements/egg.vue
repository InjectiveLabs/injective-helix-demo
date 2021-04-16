<template>
  <span></span>
</template>

<script lang="ts">
import Vue from 'vue'
// @ts-ignore
import confetti from 'canvas-confetti'
import Egg from '@/assets/js/egg'

export default Vue.extend({
  data() {
    return {
      count: 200,
      defaults: {
        origin: { y: 0.7 }
      }
    }
  },

  mounted() {
    /**
     * We started from 40 (keycode for down) cents/INJ, and now we are just going to go
     * up, up, up (38 keycode for up), till we reach the space (32 keycode for space)
     */
    new Egg().addCode('down,up,up,up,space', this.onEgg, {}).listen()
  },

  methods: {
    fire(particleRatio: number, opts: Record<string, any>) {
      confetti(
        Object.assign({}, this.defaults, opts, {
          particleCount: Math.floor(this.count * particleRatio)
        })
      )
    },

    onEgg() {
      this.fire(0.25, {
        spread: 26,
        startVelocity: 55
      })
      this.fire(0.2, {
        spread: 60
      })
      this.fire(0.35, {
        spread: 100,
        decay: 0.91,
        scalar: 0.8
      })
      this.fire(0.1, {
        spread: 120,
        startVelocity: 25,
        decay: 0.92,
        scalar: 1.2
      })
      this.fire(0.1, {
        spread: 120,
        startVelocity: 45
      })
    }
  }
})
</script>
