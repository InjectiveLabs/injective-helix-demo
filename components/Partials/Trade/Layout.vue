<script setup lang="ts">
import { Wallet } from '@injectivelabs/wallet-ts'
import { BusEvents, DontShowAgain, UiMarketWithToken } from '@/types'
import { TRADING_MESSAGES } from '@/app/data/trade'

const toast = useToast()
const appStore = useAppStore()
const accountStore = useAccountStore()
const sharedWalletStore = useSharedWalletStore()
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
    .connectAutoSign(TRADING_MESSAGES)
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

onWalletConnected(() => {
  if (!sharedWalletStore.isUserConnected) {
    return
  }

  setTimeout(() => {
    if (
      accountStore.hasBalance &&
      !sharedWalletStore.isAutoSignEnabled &&
      !sharedWalletStore.isAuthzWalletConnected &&
      sharedWalletStore.isUserConnected &&
      !appStore.userState.dontShowAgain.includes(DontShowAgain.AutoSign) &&
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
</script>

<template>
  <div class="[grid-area:stats] border-b bg-brand-900 z-30">
    <PartialsTradeCommonMarketMultiplierBanner v-bind="{ market }" />

    <slot name="stats">
      <PartialsTradeStats v-bind="{ market }" />
    </slot>
  </div>

  <div
    class="lg:trade-layout-left w-full min-h-[calc(100vh-122px)] max-lg:divide-y"
  >
    <div class="[grid-area:chart]">
      <slot name="chart">
        <PartialsTradeChart v-bind="{ market, isSpot }" />
      </slot>
    </div>

    <div class="[grid-area:form] border-r">
      <slot name="form" />
    </div>

    <div class="[grid-area:orderbook] border-r">
      <slot name="orderbook">
        <PartialsTradeOrderbook v-bind="{ market, isSpot }" />
      </slot>
    </div>

    <div
      class="[grid-area:orders] relative h-[500px] overflow-x-auto border-t border-b"
    >
      <div class="absolute left-0 right-0 top-0">
        <div class="lg:min-w-[1600px]">
          <slot name="orders" />
        </div>
      </div>
    </div>
  </div>
</template>
