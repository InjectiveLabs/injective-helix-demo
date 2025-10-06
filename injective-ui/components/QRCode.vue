<script lang="ts" setup>
import QRCodeVue3 from 'qr-code-generator-vue3'
import { injLogoBase64 } from './../data/token'

withDefaults(
  defineProps<{
    text: string
    logo?: string
    imageOptions?: object
    extraConfigs?: object
    colorSettings?: object
  }>(),
  {
    logo: '',
    imageOptions: undefined,
    colorSettings: undefined,
    extraConfigs: () => ({})
  }
)
</script>

<template>
  <div class="p-2 bg-white">
    <QRCodeVue3
      v-bind="{
        margin: 0,
        value: text,
        image: logo || injLogoBase64,
        dotsOptions: {
          type: 'dots',
          ...(colorSettings || {
            gradient: {
              type: 'radial',
              rotation: 0,
              colorStops: [
                { offset: 0.5, color: '#7C70FF' },
                { offset: 1, color: '#5208c7' }
              ]
            }
          })
        },
        imageOptions: imageOptions || { imageSize: 0.4, margin: 16 },
        cornersDotOptions: {
          type: 'dot',
          color: '#000000'
        },
        cornersSquareOptions: {
          type: 'extra-rounded',
          color: '#000'
        },
        ...extraConfigs
      }"
    />
  </div>
</template>
