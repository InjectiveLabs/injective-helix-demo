<script setup lang="ts">
import { Status, StatusType } from '@injectivelabs/utils'
import { IS_TESTNET } from '@shared/utils/constant'
import {
  trackLiteBridgeBridged,
  trackLiteBridgePageView
} from '@/app/providers/mixpanel/EventTracker'

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

withDefaults(defineProps<{ widgetClass?: string }>(), { widgetClass: '' })

const emit = defineEmits<{
  success: []
}>()

const isUmd = true

const status = reactive(new Status(StatusType.Loading))

let unmount: (() => void) | null = null

useHead({
  link: [
    {
      rel: 'stylesheet',
      href: IS_TESTNET
        ? 'https://unpkg.com/lite-bridge-widget-injective-test@0.0.5/dist/testnet/style.css'
        : 'https://unpkg.com/lite-bridge-widget-injective-test@0.0.5/dist/mainnet/style.css'
    }
  ],
  script: [
    {
      src: IS_TESTNET
        ? `https://unpkg.com/lite-bridge-widget-injective-test@0.0.5/dist/testnet/index.${
            isUmd ? 'umd' : 'es'
          }.js`
        : `https://unpkg.com/lite-bridge-widget-injective-test@0.0.5/dist/mainnet/index.${
            isUmd ? 'umd' : 'es'
          }.js`,
      type: 'module',
      tagPosition: 'bodyClose',
      onload: () => mountWidget()
    }
  ]
})

onMounted(() => trackLiteBridgePageView(sharedWalletStore.wallet))
onUnmounted(unMountWidget)

function unMountWidget() {
  if (unmount) {
    unmount()
  }
}

function mountWidget() {
  unMountWidget()

  unmount = window.createWidget('widget-container', {
    wallet: {
      wallet: sharedWalletStore.wallet,
      address: sharedWalletStore.address,
      injectiveAddress: sharedWalletStore.injectiveAddress
    },
    onSuccess: ({ wallet, amount }: { wallet: string; amount: string }) => {
      trackLiteBridgeBridged({
        wallet,
        amount,
        symbol: 'USDT'
      })

      emit('success')
    }
  })

  status.setIdle()
}
</script>

<template>
  <div class="min-h-[300px]" data-mode="dark">
    <AppHocLoading
      wrapper-class="min-h-[300px]  flex items-center justify-center"
      v-bind="{ status }"
    />

    <div id="widget-container" :class="widgetClass"></div>
  </div>
</template>
