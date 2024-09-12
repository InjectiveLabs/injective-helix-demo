<script setup lang="ts">
import { Status, StatusType } from '@injectivelabs/utils'

definePageMeta({
  layout: 'blank'
})

declare global {
  interface Window {
    InjBridgeWidget: {
      mountWidget: (container: string) => {
        unmount: () => void
      }
    }
  }
}

const status = reactive(new Status(StatusType.Loading))

let widget: {
  unmount: () => void
} | null = null

onMounted(() => {
  const scriptId = 'inj-bridge-widget-script'
  const existingScript = document.getElementById(scriptId)

  if (!existingScript) {
    const script = document.createElement('script') as HTMLScriptElement
    script.id = scriptId
    script.async = true
    script.type = 'module'
    script.src = '/widget/inj-bridge-widget.es.js'
    script.onload = () => {
      widget = window.InjBridgeWidget.mountWidget('#widget-container')
      status.setIdle()
    }

    document.body.appendChild(script)

    return
  }

  widget = window.InjBridgeWidget.mountWidget('#widget-container')
  status.setIdle()
})

onUnmounted(() => {
  if (widget) {
    widget.unmount()
  }
})
</script>

<template>
  <div>
    <link rel="stylesheet" href="/widget/style.css" />
    <AppHocLoading
      wrapper-class="min-h-[300px] flex items-center justify-center"
      v-bind="{ status }"
    />

    <div
      id="widget-container"
      class="max-w-md mx-auto w-full"
      data-mode="dark"
    ></div>
  </div>
</template>
