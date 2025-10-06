import type { ComponentCustomProperties as _ComponentCustomProperties } from 'vue'

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties extends _ComponentCustomProperties {
    $t: (key: string, ...params: any[]) => string
  }
}
