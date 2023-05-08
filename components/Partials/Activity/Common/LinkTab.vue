<script setup lang="ts">
import { PropType } from 'vue'
import { RouteLocationNamedRaw } from 'vue-router'

const route = useRoute()

const props = defineProps({
  isIndex: Boolean,

  to: {
    type: Object as PropType<RouteLocationNamedRaw>,
    required: true
  }
})

const active = computed(() => {
  if (props.isIndex) {
    return props.to.name === route.name?.toString()
  } else {
    return route.name?.toString().startsWith(props.to.name as string)
  }
})
</script>

<template>
  <NuxtLink
    :to="to"
    class="text-xs xs:text-sm leading-5 tracking-wide cursor-pointer uppercase"
    :class="[
      active
        ? 'text-blue-500 hover:text-blue-600 font-bold'
        : 'text-gray-500 hover:text-blue-500'
    ]"
  >
    <div class="flex items-center gap-1">
      <span class="whitespace-nowrap">
        <slot />
      </span>
    </div>
  </NuxtLink>
</template>
