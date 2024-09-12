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
      src: '/widget/inj-bridge-widget.es.js',
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
    InjBridgeWidget: {
      mountWidget: (
        container: string,
        props: any
      ) => {
        unmount: () => void
      }
    }
  }
}

const sharedWalletStore = useSharedWalletStore()

const wallet = computed(() => ({
  injectiveAddress: sharedWalletStore.injectiveAddress,
  wallet: sharedWalletStore.wallet
}))

withDefaults(defineProps<{ widgetClass?: string }>(), { widgetClass: '' })

const status = reactive(new Status(StatusType.Loading))

let widget: {
  unmount: () => void
} | null = null

function mountWidget() {
  widget = window.InjBridgeWidget.mountWidget('#widget-container', {
    user: wallet.value
  })
  status.setIdle()
}

onUnmounted(() => {
  if (widget) {
    widget.unmount()
  }
})
</script>

<template>
  <div key="inj-bridge-widget" data-mode="dark">
    <div
      id="widget-container"
      key="inj-bridge-widget-container"
      :class="widgetClass"
    ></div>
  </div>
</template>
