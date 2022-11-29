<template>
  <canvas
    ref="canvas"
    class="inset-0 fixed pointer-events-none w-screen h-screen z-1200"
  />
</template>

<script lang="ts">
import Vue from 'vue'
import JSConfetti from 'js-confetti'

export default Vue.extend({
  data() {
    return {
      confetti: undefined as unknown as JSConfetti
    }
  },

  computed: {
    count(): number {
      return this.$confetti.state.count
    },

    canvas(): HTMLCanvasElement | undefined {
      return this.$refs.canvas as HTMLCanvasElement
    }
  },

  watch: {
    count: {
      handler() {
        this.showConfetti()
      },
      immediate: true
    }
  },

  mounted() {
    const { canvas } = this

    if (!canvas) {
      return
    }

    this.confetti = new JSConfetti({
      canvas
    })
  },

  methods: {
    showConfetti() {
      if (!this.confetti) {
        return
      }

      this.confetti.addConfetti()
    }
  }
})
</script>
