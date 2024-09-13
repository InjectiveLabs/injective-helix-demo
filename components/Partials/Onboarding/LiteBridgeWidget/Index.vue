<script setup lang="ts">
import { Status, StatusType } from '@injectivelabs/utils'

const emit = defineEmits<{
  success: []
}>()

useHead({
  link: [
    {
      rel: 'stylesheet',
      href: 'https://unpkg.com/lite-bridge-widget-injective-test@0.0.1/dist/style.css'
    }
  ],
  script: [
    {
      src: 'https://unpkg.com/lite-bridge-widget-injective-test@0.0.1/dist/index.es.js',
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
        wallet: {
          injectiveAddress: string
          wallet: string
          address: string
        }
        onSuccess: (args: any) => any
        mock?: boolean
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
    wallet: {
      injectiveAddress: wallet.value.injectiveAddress,
      wallet: wallet.value.wallet,
      address: wallet.value.address
    },
    onSuccess: () => {
      emit('success')
    },
    mock: false
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
