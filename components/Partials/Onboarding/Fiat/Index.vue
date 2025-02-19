<script setup lang="ts">
import { usdtToken } from '@shared/data/token'
import {
  trackQrCodeBuyFunds,
  trackQrCodePageView
} from '@/app/providers/mixpanel/EventTracker'
import { PortfolioSubPage } from '@/types'

const route = useRoute()
const sharedWalletStore = useSharedWalletStore()
const notificationStore = useSharedNotificationStore()
const { t } = useI18n()
const { copy } = useClipboard()

const emit = defineEmits<{
  'funds:purchase': []
}>()

const isPortfolioBalancePage = computed(
  () => route.name === PortfolioSubPage.Balances
)

const formattedAddress = computed(() =>
  sharedEllipsisFormatText(sharedWalletStore.injectiveAddress, 8)
)

function onPurchaseFunds() {
  trackQrCodeBuyFunds(sharedWalletStore.wallet)
  emit('funds:purchase')
}

function onCopyInjectiveAddress() {
  copy(sharedWalletStore.injectiveAddress)
  notificationStore.success({ title: t('connect.copiedAddress') })
}

onMounted(() => {
  trackQrCodePageView(sharedWalletStore.wallet)
})
</script>

<template>
  <div class="text-center">
    <h2 class="font-semibold text-xl pt-2 text-white">
      {{ $t('onboarding.depositInjNetworkAsset') }}
    </h2>

    <p class="text-sm mt-4 text-white">
      {{
        $t(
          `onboarding.${
            isPortfolioBalancePage
              ? 'depositNowDescription'
              : 'fundsNeededDescription'
          }`
        )
      }}
    </p>

    <div class="max-w-[300px] mx-auto mt-8">
      <SharedQRCode
        class="w-full rounded-lg overflow-hidden"
        :text="sharedWalletStore.injectiveAddress"
      />

      <div
        class="flex items-center gap-2 rounded-lg mt-4 justify-between max-w-xs mx-auto"
      >
        <p class="text-white font-medium">{{ formattedAddress }}</p>
        <AppButton
          class="py-2 border-none text-base leading-5 font-semibold"
          @click="onCopyInjectiveAddress"
        >
          {{ $t('onboarding.copy') }}
        </AppButton>
      </div>
    </div>

    <div class="grid grid-cols-1 gap-4 mt-6">
      <AppButton
        class="w-full text-base leading-5 py-2.5 font-semibold"
        @click="onPurchaseFunds"
      >
        {{ $t('onboarding.qr.cta') }}
      </AppButton>

      <PartialsCommonBridgeRedirection :denom="usdtToken.denom">
        <AppButton
          variant="primary-outline"
          class="w-full text-white hover:text-white text-base leading-5 py-2.5 font-semibold"
        >
          {{ $t('onboarding.qr.bridge') }}
        </AppButton>
      </PartialsCommonBridgeRedirection>
    </div>
  </div>
</template>
