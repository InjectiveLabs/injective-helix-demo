import { ThrownException } from '@injectivelabs/exceptions'
import VueI18n, { Path, Values, Locale } from 'vue-i18n/types'
import VueRouter from 'vue-router'
import { Toasted } from 'vue-toasted'
import { accessorType } from '~/store'

/**
 * Overloads VueI18n interface to avoid needing to cast return value to string.
 */
declare module 'vue-i18n/types' {
  export default class VueI18n {
    t(key: Path, locale: Locale, values?: Values): string
    // eslint-disable-next-line no-dupe-class-members
    t(key: Path, values?: Values): string
  }
}

declare module 'vue/types/vue' {
  interface Vue {
    $toast: Toasted
    $t: typeof VueI18n.prototype.t
    $onError: (e: ThrownException) => void
    $onRejected: (e: ThrownException) => void
    $onConfirm: (e: string, cb: Function) => void
    $router: VueRouter
    $accessor: typeof accessorType
    // $attrs: Record<string, string>
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface VueConstructor<V extends Vue = Vue> {
    i18n: typeof VueI18n.prototype
  }
}

declare module '@nuxt/types' {
  interface NuxtAppOptions {
    $accessor: typeof accessorType
    $toast: Toasted
    $attrs: Record<string, any>
  }
}
