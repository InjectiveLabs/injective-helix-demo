<script setup lang="ts">
import { PortfolioSubPage } from '@/types'
import {
  trackQrCodeBuyFunds,
  trackQrCodePageView
} from '@/app/providers/mixpanel/EventTracker'

const route = useRoute()
const sharedWalletStore = useSharedWalletStore()
const notificationStore = useSharedNotificationStore()
const { copy } = useClipboard()
const { t } = useI18n()

const emit = defineEmits<{
  'funds:purchase': []
  'modal:close': []
}>()

const isPortfolioBalancePage = computed(
  () => route.name === PortfolioSubPage.Balances
)

const formattedAddress = computed(() =>
  sharedEllipsisFormatText(sharedWalletStore.injectiveAddress, 8)
)

function onCloseModal() {
  emit('modal:close')
}

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
    <h2 class="font-semibold text-xl -mt-4">
      {{ $t('onboarding.depositInjNetworkAsset') }}
    </h2>

    <p class="text-sm mt-4">
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
        color="#40A9FF"
      />

      <div
        class="flex items-center gap-2 rounded-lg mt-4 justify-between max-w-xs mx-auto"
      >
        <p>{{ formattedAddress }}</p>
        <AppButton @click="onCopyInjectiveAddress">
          {{ $t('onboarding.copy') }}
        </AppButton>
      </div>
    </div>

    <div class="grid grid-cols-1 gap-2 mt-4">
      <AppButton class="w-full" @click="onPurchaseFunds">
        {{ $t('onboarding.qr.cta') }}
      </AppButton>

      <AppButton
        v-if="!isPortfolioBalancePage"
        variant="primary-ghost"
        class="w-full text-coolGray-400 hover:text-white"
        @click="onCloseModal"
      >
        {{ $t('onboarding.qr.skip') }}
      </AppButton>
    </div>
  </div>
</template>
