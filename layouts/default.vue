<script lang="ts" setup>
import { Status, StatusType } from '@injectivelabs/utils'
import { BusEvents } from '@/types'
import { ROUTES } from '@/app/utils/constants'

const route = useRoute()
const appStore = useAppStore()
const bankStore = useBankStore()
const spotStore = useSpotStore()
const tokenStore = useTokenStore()
const walletStore = useWalletStore()
const accountStore = useAccountStore()
const exchangeStore = useExchangeStore()
const derivativeStore = useDerivativeStore()
const { $onError } = useNuxtApp()

const status = reactive(new Status(StatusType.Loading))
const isOpenSidebar = ref(false)

const container = computed(() => document.getElementById('pro'))

const showFooter = computed(() =>
  ROUTES.footerEnabledRoutes.includes(route.name as string)
)

onMounted(() => {
  Promise.all([walletStore.init(), tokenStore.fetchSupplyTokenMeta()])
    .catch($onError)
    .finally(() => {
      status.setIdle()
    })

  // Actions that should't block the app from loading
  Promise.all([
    appStore.init(),
    spotStore.init(),
    derivativeStore.init(),
    exchangeStore.initFeeDiscounts()
  ])

  useEventBus<string>(BusEvents.NavLinkClicked).on(onCloseSideBar)
})

onWalletConnected(() => {
  Promise.all([
    bankStore.fetchBalances(),
    accountStore.fetchSubaccounts(),
    accountStore.streamSubaccountBalances()
  ]).catch($onError)
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
            <client-only>
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
                    <NuxtPage />
                  </div>
                  <LayoutFooter v-if="showFooter" />
                </main>

                <ModalsInsufficientInjForGas />
                <ModalsNinjaPassWinner />
                <ModalsUserFeedback />
                <AppConfetti />
                <div id="modals" />
              </div>
            </client-only>
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
          <template #close="{ close }">
            <BaseIcon
              name="close-bold"
              class="min-w-4 hover:text-blue-500 text-white w-4 h-4"
              @click="close"
            />
          </template>
        </BaseNotification>
      </template>
    </BaseNotifications>
  </div>
</template>
