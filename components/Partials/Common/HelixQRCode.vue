<script lang="ts" setup>
import { helixLogoBase64 } from '@shared/data/token'

withDefaults(
  defineProps<{
    qrLink: string
  }>(),
  {}
)
</script>

<template>
  <SharedQRCode
    v-bind="{
      text: qrLink,
      logo: helixLogoBase64,
      imageOptions: { imageSize: 0.5, margin: 12 },
      colorSettings: {
        gradient: {
          type: 'radial',
          rotation: 0,
          colorStops: [
            { offset: 0.5, color: '#007CF6' },
            { offset: 1, color: '#40A9FF' }
          ]
        }
      }
    }"
  />
</template>
