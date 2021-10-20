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
    $router: VueRouter
    $accessor: typeof accessorType
    $onRejected: (e: any) => void
    $onError: (e: any) => void
    $onConfirm: (message: string, handler: Function) => void
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface VueConstructor<V extends Vue = Vue> {
    i18n: typeof VueI18n.prototype
  }
}

declare module '@nuxt/types' {
  interface NuxtAppOptions {
    $toast: Toasted
    $accessor: typeof accessorType
  }
}
