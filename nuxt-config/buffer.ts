export default defineNuxtPlugin(() => {
  import('buffer/').then((Buffer) => {
    window.Buffer = window.Buffer || Buffer.default.Buffer
    globalThis.Buffer = window.Buffer || Buffer.default.Buffer
  })
})
