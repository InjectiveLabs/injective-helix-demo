import { ThrownException } from '@injectivelabs/exceptions'
import VueI18n, { Path, Values, Locale } from 'vue-i18n/types'
import { ConfettiPlugin } from '@/plugins/confetti'
import { WindowPlugin } from '@/plugins/window'

/**
 * Overloads VueI18n interface to avoid needing to cast return value to string.
 */
declare module 'vue-i18n/types' {
  export default class VueI18n {
    t(key: Path, locale: Locale, values?: Values): string
    t(key: Path, values?: Values): string
  }
}

declare module 'vue/types/vue' {
  interface Vue {
    $t: typeof VueI18n.prototype.t
    $onError: (e: ThrownException) => void
    $onConfirm: (e: string, cb: Function) => void
    $confetti: ConfettiPlugin
    $window: WindowPlugin
  }
}

declare module '@nuxt/types' {
  interface NuxtAppOptions {
    $accessor: typeof accessorType
    $attrs: Record<string, any>
  }
}

declare module '#app' {
  interface NuxtApp {
    $onError: (e: ThrownException) => void
  }
}
