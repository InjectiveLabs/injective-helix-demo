<script lang="ts" setup>
import { Status, StatusType } from '@injectivelabs/utils'
import { ROUTES } from '@/app/utils/constants'
import { BusEvents, MainPage } from '@/types'

const route = useRoute()
const appStore = useAppStore()
const spotStore = useSpotStore()
const authzStore = useAuthZStore()
const tokenStore = useTokenStore()
const walletStore = useWalletStore()
const exchangeStore = useExchangeStore()
const derivativeStore = useDerivativeStore()
const { $onError } = useNuxtApp()

const status = reactive(new Status(StatusType.Loading))
const isOpenSidebar = ref(false)

const container = computed(() => document.getElementById('pro'))

const showFooter = computed(() =>
  ROUTES.footerEnabledRoutes.includes(route.name as MainPage)
)

onMounted(() => {
  Promise.all([walletStore.init(), tokenStore.fetchTokens()])
    .catch($onError)
    .finally(() => {
      status.setIdle()
    })

  // Actions that should't block the app from loading
  Promise.all([
    appStore.init(),
    appStore.fetchBlockHeight(),
    spotStore.initIfNotInit(),
    spotStore.fetchMarketsSummary(),
    derivativeStore.initIfNotInit(),
    derivativeStore.fetchMarketsSummary(),
    exchangeStore.initFeeDiscounts(),
    authzStore.fetchGrants()
  ])

  Promise.all([authzStore.fetchGrants()]).then(() => {})

  useEventBus<string>(BusEvents.NavLinkClicked).on(onCloseSideBar)
})

function onOpenSideBar() {
  isOpenSidebar.value = true

  container.value?.classList.add('overflow-y-hidden')
}

function onCloseSideBar() {
  if (isOpenSidebar.value) {
    isOpenSidebar.value = false

    container.value?.classList.remove('overflow-y-hidden')
  }
}

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
</script>

<template>
  <div
    id="pro"
    class="flex min-h-screen max-h-screen bg-gray-1000 text-gray-100 relative overflow-x-hidden"
  >
    <transition name="page" appear>
      <div class="min-h-screen w-full">
        <AppHocLoading :status="status" class="h-full">
          <div class="w-full">
            <LayoutSidebarMobile
              v-bind="{
                isOpenSidebar
              }"
              @sidebar:closed="onCloseSideBar"
            />
            <ClientOnly>
              <div class="bg-gray-1000">
                <LayoutTopbar
                  :is-sidebar-open="isOpenSidebar"
                  @sidebar:opened="onOpenSideBar"
                  @sidebar:closed="onCloseSideBar"
                />
                <main
                  class="flex flex-wrap relative min-h-screen-excluding-header"
                  :class="{
                    'flex-col': showFooter,
                    'pt-12': isOpenSidebar
                  }"
                >
                  <div
                    class="w-screen"
                    :class="[
                      { 'max-h-screen-excluding-header': !showFooter },
                      showFooter ? 'flex-auto' : 'flex-1'
                    ]"
                  >
                    <div id="legacy-wormhole-banner" />
                    <NuxtPage />
                  </div>
                  <LayoutFooter v-if="showFooter" />
                </main>

                <ModalsNinjaPassWinner />

                <!-- hide survey for now but can be resurrected and modified for future surveys -->
                <!-- <ModalsUserFeedback /> -->
                <!-- <ModalsNewFeature /> -->
                <ModalsPostOnlyMode />
                <ModalsDevMode />
                <AppConfetti />
                <div id="modals" />
              </div>
            </ClientOnly>
          </div>
        </AppHocLoading>
      </div>
    </transition>
    <BaseNotifications
      class="z-[1110] fixed inset-0 flex flex-col gap-2 justify-end items-end p-6 pointer-events-none"
    >
      <template #notification="{ notification }">
        <BaseNotification
          :notification="notification"
          class="pointer-events-auto bg-gray-800"
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
