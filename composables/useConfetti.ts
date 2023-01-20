import { ref } from 'vue'
import JSConfetti from 'js-confetti'

const confetti = ref()

export default function useConfetti() {
  function init(canvas: any) {
    confetti.value = new JSConfetti({
      canvas: canvas.value
    })
  }

  function showConfetti() {
    if (!confetti.value) {
      return
    }

    confetti.value.addConfetti()
  }

  return { init, showConfetti }
}
