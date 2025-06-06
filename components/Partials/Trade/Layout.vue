<script setup lang="ts">
import { Wallet } from '@injectivelabs/wallet-base'
import { TRADING_MESSAGES } from '@/app/data/trade'
import { BusEvents, DontShowAgain, UiMarketWithToken } from '@/types'

const toast = useToast()
const appStore = useAppStore()
const accountStore = useAccountStore()
const sharedWalletStore = useSharedWalletStore()
const gridStrategyStore = useGridStrategyStore()
const { $onError } = useNuxtApp()
const { t } = useLang()

withDefaults(
  defineProps<{
    isSpot?: boolean
    market: UiMarketWithToken
  }>(),
  {
    isSpot: false
  }
)

function connectAutoSign() {
  sharedWalletStore
    .connectAutoSign(
      TRADING_MESSAGES
      // CONTRACT_EXECUTION_COMPAT_AUTHZ // TODO: Add this when we have authz contract exec support
    )
    .then(() => {
      useEventBus(BusEvents.AutoSignConnected).emit()

      toast.add({
        title: t('portfolio.settings.autoSign.enabledToast.title'),
        description: t('portfolio.settings.autoSign.enabledToast.description')
      })
    })
    .catch($onError)
}

function dontShowAutoSignAgain() {
  appStore.$patch({
    userState: {
      ...appStore.userState,
      dontShowAgain: [
        ...appStore.userState.dontShowAgain,
        DontShowAgain.AutoSign
      ]
    }
  })
}

let timeout: NodeJS.Timeout | undefined

onWalletConnected(() => {
  if (!sharedWalletStore.isUserConnected) {
    return
  }

  clearTimeout(timeout)

  timeout = setTimeout(() => {
    if (
      accountStore.hasBalance &&
      !sharedWalletStore.isAutoSignEnabled &&
      !sharedWalletStore.isAuthzWalletConnected &&
      sharedWalletStore.isUserConnected &&
      !appStore.userState.dontShowAgain?.includes(DontShowAgain.AutoSign) &&
      sharedWalletStore.wallet !== Wallet.Magic
    ) {
      toast.add({
        title: t('portfolio.settings.autoSign.enable'),
        description: t('portfolio.settings.autoSign.allowsYouToTrade'),
        actions: [
          {
            label: t('common.enable'),
            variant: 'soft',
            color: 'primary',
            click: connectAutoSign
          },
          {
            label: t('common.dontShowAgain'),
            variant: 'soft',
            color: 'red',
            click: dontShowAutoSignAgain
          }
        ]
      })
    }
  }, 8000)
})

onUnmounted(() => {
  if (timeout) {
    clearTimeout(timeout)
  }
})

useIntervalFn(() => {
  gridStrategyStore.fetchAllStrategies()
}, 10000)
</script>

<template>
  <div class="[grid-area:stats] border-b bg-brand-900 z-30">
    <PartialsTradeCommonMarketMultiplierBanner v-bind="{ market }" />

    <slot name="stats">
      <PartialsTradeStats v-bind="{ market }" />
    </slot>
  </div>

  <div
    class="lg:trade-layout-right w-full min-h-[calc(100vh-140px)] max-lg:divide-y"
  >
    <div class="[grid-area:chart]">
      <slot name="chart">
        <PartialsTradeChart v-bind="{ market, isSpot }" />
      </slot>
    </div>

    <div class="[grid-area:form] border-coolGray-700 lg:min-h-[950px]">
      <slot name="form" />
    </div>

    <div class="[grid-area:orderbook] border-r">
      <slot name="orderbook">
        <PartialsTradeOrderbook v-bind="{ market, isSpot }" />
      </slot>
    </div>

    <div
      class="[grid-area:orders] relative lg:h-full border-t border-r lg:overflow-auto"
    >
      <div class="lg:absolute left-0 right-0 top-0 h-full">
        <slot name="orders" />
      </div>
    </div>
  </div>

  <PartialsTradeNotificationLimit v-bind="{ isSpot }" />
</template>
