<script setup lang="ts">
import { Status, StatusType } from '@injectivelabs/utils'

useHead({
  link: [
    {
      rel: 'stylesheet',
      href: '/widget/style.css'
    }
  ],
  script: [
    {
      src: '/widget/index.es.js',
      type: 'module',
      tagPosition: 'bodyClose',
      onload: () => {
        mountWidget()
      }
    }
  ]
})

declare global {
  interface Window {
    createWidget: (
      container: string,
      props?: {
        injectiveAddress: string
        wallet: string
        address: string
      }
    ) => () => void
  }
}

const sharedWalletStore = useSharedWalletStore()

const wallet = computed(() => ({
  injectiveAddress: sharedWalletStore.injectiveAddress,
  wallet: sharedWalletStore.wallet,
  address: sharedWalletStore.address
}))

withDefaults(defineProps<{ widgetClass?: string }>(), { widgetClass: '' })

const status = reactive(new Status(StatusType.Loading))

let unmount: (() => void) | null = null

function mountWidget() {
  if (unmount) {
    unmount()
  }

  unmount = window.createWidget('widget-container', {
    injectiveAddress: wallet.value.injectiveAddress,
    wallet: wallet.value.wallet,
    address: wallet.value.address
  })
  status.setIdle()
}

onUnmounted(() => {
  if (unmount) {
    unmount()
  }
})
</script>

<template>
  <div class="min-h-[300px]" data-mode="dark">
    <AppHocLoading
      wrapper-class="min-h-[500px]  flex items-center justify-center"
      v-bind="{ status }"
    />

    <div id="widget-container" :class="widgetClass"></div>
  </div>
</template>
