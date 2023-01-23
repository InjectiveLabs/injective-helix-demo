<script lang="ts" setup>
import { Status, StatusType } from '@injectivelabs/utils'
import {
  amplitudeTracker,
  CosmoverseGiveawayCampaignArgs
} from '@/app/providers/AmplitudeTracker'
import { BusEvents } from '@/types'

const route = useRoute()
const appStore = useAppStore()
const spotStore = useSpotStore()
const derivativeStore = useDerivativeStore()
const ninjaPassStore = useNinjaPassStore()
const referralStore = useReferralStore()
const walletStore = useWalletStore()
const bankStore = useBankStore()
const exchangeStore = useExchangeStore()
const accountStore = useAccountStore()
const { $onError } = useNuxtApp()

const status = reactive(new Status(StatusType.Loading))
const isOpenSidebar = ref(false)

const showFooter = computed(() => {
  return [
    'index',
    'markets',
    'fee-discounts',
    'leaderboard',
    'account'
  ].includes(route.name as string)
})

onMounted(() => {
  handleCosmoverseGiveawayCampaignTrack()
  handleNinjaPassGiveaway()

  Promise.all([walletStore.init()])
    .catch($onError)
    .finally(() => {
      status.setIdle()
    })

  // Actions that should't block the app from loading
  Promise.all([
    appStore.init(),
    appStore.fetchGasPrice(),
    referralStore.init(),
    exchangeStore.initFeeDiscounts()
  ])

  onLoadMarketsInit()

  useEventBus<string>(BusEvents.NavLinkClicked).on(onCloseSideBar)
})

onWalletConnected(() => {
  Promise.all([bankStore.init(), accountStore.init()]).catch($onError)
})

function handleCosmoverseGiveawayCampaignTrack() {
  if (!route.query || !route.query.utm_source) {
    return
  }

  amplitudeTracker.submitCosmoverseGiveawayCampaignTrackEvent(
    route.query as unknown as CosmoverseGiveawayCampaignArgs
  )
}

function handleNinjaPassGiveaway() {
  ninjaPassStore.fetchCodes()
}

function onLoadMarketsInit() {
  appStore.setMarketsLoadingState(StatusType.Loading)

  Promise.all([spotStore.init(), derivativeStore.init()])
    .catch($onError)
    .finally(() => {
      appStore.setMarketsLoadingState(StatusType.Idle)
    })
}

function onCloseSideBar() {
  if (isOpenSidebar.value) {
    isOpenSidebar.value = false
  }
}
</script>

<template>
  <div
    id="pro"
    class="w-full h-full min-h-screen bg-gray-1000 text-gray-100 relative"
  >
    <transition name="page" appear>
      <AppHocLoading :status="status">
        <div>
          <LayoutSidebarMobile
            v-if="isOpenSidebar"
            @sidebar-closed="onCloseSideBar"
          />
          <client-only>
            <div class="relative bg-gray-1000">
              <LayoutTopbar
                :is-sidebar-open="isOpenSidebar"
                @sidebar-opened="isOpenSidebar = true"
                @sidebar-closed="onCloseSideBar"
              />
              <main
                class="w-full h-full min-h-screen-excluding-header flex flex-col"
                :class="{ 'pt-12': isOpenSidebar }"
              >
                <div class="relative h-full-flex">
                  <NuxtPage />
                </div>
                <LayoutFooter v-if="showFooter" />
              </main>

              <ModalsInsufficientInjForGas />
              <ModalsNinjaPassWinner />
              <AppConfetti />
              <div id="modals" />
            </div>
          </client-only>
        </div>
      </AppHocLoading>
    </transition>

    <Notifications
      class="z-1110 fixed inset-0 flex flex-col gap-2 justify-end items-end p-6 pointer-events-none"
    >
      <template #notification="{ notification }">
        <Notification
          :notification="notification"
          class="pointer-events-auto bg-gray-800"
        >
          <template #close="{ close }">
            <BaseIcon
              name="close-bold"
              class="min-w-4 hover:text-blue-500 text-white w-4 h-4"
              @click="close"
            />
          </template>
        </Notification>
      </template>
    </Notifications>
  </div>
</template>
