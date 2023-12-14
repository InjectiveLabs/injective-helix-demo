<script lang="ts" setup>
import { thumbnailMap } from '@/app/data/campaign'

const props = defineProps({
  isLg: Boolean,
  isXl: Boolean,

  thumbnailId: {
    type: String,
    required: true
  }
})

const imgPath = computed(() => thumbnailMap[props.thumbnailId])

const sizeClasses = computed(() => {
  if (props.isLg) {
    return 'w-10 h-10'
  }

  if (props.isXl) {
    return 'w-20 h-20'
  }

  return 'w-6 h-6'
})
</script>

<template>
  <img :src="imgPath" :class="sizeClasses" />
</template>
