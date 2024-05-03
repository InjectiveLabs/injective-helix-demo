<script lang="ts" setup>
import { Modal, MainPage } from '@/types'

const appStore = useAppStore()
const modalStore = useModalStore()
const authzStore = useAuthZStore()
const walletStore = useWalletStore()
const ninjaPassStore = useNinjaPassStore()
const confetti = useConfetti()
const router = useRouter()

const props = defineProps({
  isSidebarOpen: Boolean
})

const emit = defineEmits<{
  'sidebar:closed': []
  'sidebar:opened': []
}>()

const isUserConnectedProcessCompleted = ref(false)

const hasNinjaPassCodes = computed(() => {
  if (!ninjaPassStore.codes) {
    return false
  }

  return ninjaPassStore.codes.length > 0
})

watch(
  () => walletStore.isUserWalletConnected,
  (newIsUserWalletConnected) => {
    if (!newIsUserWalletConnected) {
      isUserConnectedProcessCompleted.value = false
    }
  }
)

onMounted(() => {
  if (walletStore.isUserWalletConnected) {
    isUserConnectedProcessCompleted.value = true
  }
})

function toggleSidebar() {
  if (props.isSidebarOpen) {
    return emit('sidebar:closed')
  }

  emit('sidebar:opened')
}

function showNinjaPassModal() {
  modalStore.openModal(Modal.NinjaPassWinner)
  confetti.showConfetti()
}
</script>

<template>
  <header
    class="w-full z-40 h-12 lg:h-14 bg-gray-1000 flex items-center border-b border-b-gray-900"
    :class="{
      fixed: isSidebarOpen,
      relative: !isSidebarOpen
    }"
  >
    <div
      class="cursor-pointer pl-6 lg:pr-6 lg:border-r flex items-center"
      @click="router.push({ name: MainPage.Index })"
    >
      <AssetLogo class="w-auto h-6 lg:h-[30px]" alt="Helix" />
    </div>
    <div class="flex-1 px-2 lg:px-6 flex justify-end lg:justify-between">
      <div
        class="relative h-0 -z-10 w-0 opacity-0 lg:h-full lg:z-0 lg:w-full lg:opacity-100 flex items-center"
      >
        <LayoutNav class="hidden lg:block" />
      </div>
      <div class="flex items-center">
        <LayoutNavItemDummy
          v-if="walletStore.isUserWalletConnected && hasNinjaPassCodes"
          class="flex px-0 w-10 items-center justify-center"
          @click="showNinjaPassModal"
        >
          <SharedIcon name="gift" class="text-white w-4 h-4" />
        </LayoutNavItemDummy>

        <LayoutNavItem
          v-if="walletStore.isUserWalletConnected"
          class="hidden lg:flex"
          data-cy="header-activity-link"
          :to="{ name: MainPage.Activity }"
        >
          {{ $t('navigation.activity') }}
        </LayoutNavItem>

        <LayoutNavItem
          v-if="walletStore.isUserWalletConnected"
          class="hidden lg:flex"
          data-cy="header-account-link"
          :to="{ name: MainPage.Account }"
        >
          {{ $t('navigation.account') }}
        </LayoutNavItem>

        <LayoutAuthZ
          v-if="
            authzStore.hasGranterOrGranteeGrants &&
            appStore.isAuthzManagementActive
          "
          class="hidden lg:flex"
        />
        <LayoutWallet />

        <LayoutNavItemDummy
          v-if="walletStore.isUserWalletConnected"
          class="hidden lg:flex px-0 w-10 items-center justify-center"
          @click="() => {}"
        >
          <LayoutPreferences v-if="walletStore.isUserWalletConnected" />
        </LayoutNavItemDummy>
      </div>
    </div>
    <button
      class="px-4 border-r border-gray-600 text-gray-200 lg:hidden"
      @click.stop="toggleSidebar"
    >
      <SharedIcon v-if="isSidebarOpen" name="close" class="w-6 h-6" />
      <SharedIcon v-else name="menu" class="w-6 h-6" />
    </button>
  </header>
</template>
