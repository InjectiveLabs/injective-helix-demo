<script lang="ts" setup>
import { Status, StatusType } from '@injectivelabs/utils'
import { ROUTES } from '@/app/utils/constants'
import { MainPage } from '@/types'

const route = useRoute()
const appStore = useAppStore()
const spotStore = useSpotStore()
const authzStore = useAuthZStore()
const tokenStore = useTokenStore()
const walletStore = useWalletStore()
const accountStore = useAccountStore()
const exchangeStore = useExchangeStore()
const derivativeStore = useDerivativeStore()
const { $onError } = useNuxtApp()

const status = reactive(new Status(StatusType.Loading))

const showFooter = computed(() =>
  ROUTES.footerEnabledRoutes.includes(route.name as MainPage)
)

onMounted(() => {
  Promise.all([
    walletStore.init(),
    tokenStore.fetchTokens(),
    spotStore.initIfNotInit(),
    derivativeStore.initIfNotInit(),
    derivativeStore.fetchMarketsSummary(),
    spotStore.fetchMarketsSummary(),
    exchangeStore.initFeeDiscounts()
  ])
    .catch($onError)
    .finally(() => {
      status.setIdle()
    })

  // Actions that should't block the app from loading
  Promise.all([
    appStore.init(),
    appStore.fetchBlockHeight(),
    authzStore.fetchGrants()
  ])
})

/**
 * Post only mode modal when we do chain upgrade
watch(
  () => appStore.blockHeight,
  () => {
    if (
      appStore.blockHeight >= MAINNET_UPGRADE_BLOCK_HEIGHT &&
      appStore.blockHeight <=
        MAINNET_UPGRADE_BLOCK_HEIGHT + POST_ONLY_MODE_BLOCK_THRESHOLD
    ) {
      modalStore.openModal(Modal.PostOnlyMode)
    }
  }
)
 */

watch(
  () => accountStore.subaccountId,
  (subaccountId) => {
    accountStore.cancelSubaccountBalanceStream()
    accountStore.cancelBankBalanceStream()

    accountStore.fetchAccountPortfolioBalances()
    accountStore.streamSubaccountBalance(subaccountId)
    accountStore.streamBankBalance()
  },
  { immediate: true }
)
</script>

<template>
  <div class="relative">
    <AppHocLoading is-helix wrapper-class="h-screen" :status="status">
      <LayoutNavbar />
      <main class="relative">
        <NuxtPage />
      </main>

      <ModalsNinjaPassWinner />
      <!-- hide survey for now but can be resurrected and modified for future surveys -->
      <!-- <ModalsUserFeedback /> -->
      <!-- <ModalsNewFeature /> -->
      <ModalsPostOnlyMode />
      <ModalsDevMode />
      <AppConfetti />

      <LayoutFooter v-if="showFooter" />
      <LayoutStatusBar />
    </AppHocLoading>

    <div id="modals" />

    <BaseNotifications
      class="z-[1110] fixed inset-0 flex flex-col gap-2 justify-end items-end p-6 pointer-events-none"
    >
      <template #notification="{ notification }">
        <BaseNotification
          :notification="notification"
          class="pointer-events-auto bg-brand-900"
          wrapper-class="bg-brand-900 border-brand-700 border"
        >
          <template #close="{ closeNotification }">
            <BaseIcon
              name="close-bold"
              class="min-w-4 hover:text-blue-500 text-white w-4 h-4"
              @click="closeNotification"
            />
          </template>
        </BaseNotification>
      </template>
    </BaseNotifications>
  </div>
</template>
