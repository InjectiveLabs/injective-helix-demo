<script lang="ts" setup>
const isProduction = process.env.NODE_ENV === 'production'
const isWebpack = process.env.BUILDER_TYPE === 'webpack' || isProduction

const props = defineProps({
  view: {
    type: String,
    required: true
  }
})

const activityComponent = defineAsyncComponent(() => {
  return new Promise((resolve, _reject) => {
    if (!isWebpack) {
      const comps = import.meta.glob(/* @vite-ignore */ './**/*.vue')

      return comps[/* @vite-ignore */ `./Views/${props.view}.vue`]().then(
        (component) => resolve(component.default)
      )
    }

    // webpack
    import(/* @vite-ignore */ `./Views/${props.view}.vue`).then((component) =>
      resolve(component)
    )
  })
})
</script>

<script lang="ts">
export default {
  inheritAttrs: false
}
</script>

<template>
  <div class="mt-4 bg-gray-900 grow h-full-flex overflow-y-scroll">
    <Suspense>
      <component v-bind="$attrs" :is="activityComponent" />

      <template #fallback>
        <div class="w-full flex-grow flex justify-center items-center">
          <AppLoading class="relative" />
        </div>
      </template>
    </Suspense>
  </div>
</template>
