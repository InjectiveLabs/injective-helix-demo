
<script setup lang="ts">
import { computed, useAttrs, defineAsyncComponent } from 'vue'

const attrs = useAttrs()

const props = defineProps({
  isXs: Boolean,
  isSm: Boolean,
  isMd: Boolean,
  isLg: Boolean,

  name: {
    type: String,
    required: true
  }
})

const filteredAttrs = computed(() => {
  const filteredAttrs = { ...attrs }

  const classes = (filteredAttrs.class as string) || ''
  const defaultClasses: string[] = []

  if (!classes.includes('cursor-')) {
    defaultClasses.push('cursor-pointer')
  }

  if (
    !classes.includes('w-') &&
    !classes.includes('h-') &&
    !classes.includes('min-w-')
  ) {
    if (props.isXs) {
      defaultClasses.push('h-2 w-2 min-w-2')
    } else if (props.isSm) {
      defaultClasses.push('h-3 w-3 min-w-3')
    } else if (props.isMd) {
      defaultClasses.push('h-4 w-4 min-w-4')
    } else if (props.isLg) {
      defaultClasses.push('h-10 w-10 min-w-10')
    } else {
      defaultClasses.push('h-6 w-6 min-w-6')
    }
  }

  return { ...attrs, class: [...defaultClasses, classes].join(' ') }
})

/* temp fix: vite dev not dont support dynamic path
  https://github.com/vitejs/vite/issues/4945
  https://vitejs.dev/guide/features.html#glob-import
*/
const dynamicComponent = defineAsyncComponent<Record<string, unknown>>(() => {
  let name = props.name

  if (name.includes('trezor')) {
    name = 'wallet/trezor'
  }

  if (name.includes('ledger-legacy')) {
    name = 'wallet/ledger'
  }

  if (name.includes('ledger')) {
    name = 'wallet/ledger'
  }

  if (name.includes('turnkey')) {
    name = 'wallet/turnkey'
  }

  return new Promise((resolve, _reject) => {
    const comps = import.meta.glob('./../icons/**/*.vue')

    try {
      return comps[`../icons/${name}.vue`]().then((component: any) =>
        resolve(component.default)
      )
    } catch (e) {
       
      console.log({ e, name })
    }
  })
})
</script>

<script lang="ts">
export default {
  inheritAttrs: false
}
</script>

<template>
  <Suspense>
    <component v-bind="filteredAttrs" :is="dynamicComponent" />
    <template #fallback>
      <div v-bind="filteredAttrs" />
    </template>
  </Suspense>
</template>
