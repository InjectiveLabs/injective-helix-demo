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
        mock?: boolean
        onSuccess: (args: any) => any
        onBalanceFetched: (args: any) => any
      }
    ) => () => void
  }
}

const sharedWalletStore = useSharedWalletStore()

const emit = defineEmits<{
  'on:success': []
  'fiat:select': []
}>()

const isUmd = true

const status = reactive(new Status(StatusType.Loading))

let unmount: (() => void) | null = null

useHead({
  link: [
    {
      rel: 'stylesheet',
      href: IS_TESTNET
        ? 'https://unpkg.com/lite-bridge-widget-injective-test@0.0.12/dist/testnet/style.css'
        : 'https://unpkg.com/lite-bridge-widget-injective-test@0.0.12/dist/mainnet/style.css'
    }
  ],
  script: [
    {
      src: IS_TESTNET
        ? `https://unpkg.com/lite-bridge-widget-injective-test@0.0.12/dist/testnet/index.${
            isUmd ? 'umd' : 'es'
          }.js`
        : `https://unpkg.com/lite-bridge-widget-injective-test@0.0.12/dist/mainnet/index.${
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

      emit('on:success')
    },
    onBalanceFetched: () => {
      status.setIdle()
    }
  })
}

function buyInjWithCard() {
  emit('fiat:select')
}
</script>

<template>
  <div class="min-h-[300px]" data-mode="dark">
    <AppHocLoading
      v-bind="{ status }"
      wrapper-class="min-h-[300px] flex items-center justify-center"
    />

    <div
      class="p-6 border border-[#42474E] rounded-lg"
      :class="{ 'h-0 opacity-0 pointer-events-none': status.isLoading() }"
    >
      <div id="widget-container" />

      <div class="mt-5">
        <AppButton
          variant="primary"
          class="w-full px-4 py-2.5 text-sm font-medium rounded-lg bg-azure-blue-350 hover:bg-azure-blue-350/80 transition-colors ring-0 border-0"
          @click="buyInjWithCard"
        >
          {{ $t('common.modal.onboarding.buyInjWithCard') }}
        </AppButton>
      </div>
    </div>
  </div>
</template>
