import { Buffer } from 'buffer'

const globalScope = globalThis as typeof globalThis & { Buffer?: typeof Buffer }

export default defineNuxtPlugin(() => {
  globalScope.Buffer = globalScope.Buffer || Buffer

  const windowScope = window as Window & { Buffer?: typeof Buffer }

  windowScope.Buffer = windowScope.Buffer || Buffer
})
