<script lang="ts" setup>
import { Modal } from '@/types'

const modalStore = useModalStore()
const walletStore = useWalletStore()
const ninjaPassStore = useNinjaPassStore()
const confetti = useConfetti()
const router = useRouter()

const props = defineProps({
  isSidebarOpen: Boolean
})

const emit = defineEmits<{
  (e: 'sidebar:closed'): void
  (e: 'sidebar:opened'): void
}>()

const isUserConnectedProcessCompleted = ref(false)

const isUserWalletConnected = computed(() => walletStore.isUserWalletConnected)

const hasNinjaPassCodes = computed(() => {
  if (!ninjaPassStore.codes) {
    return false
  }

  return ninjaPassStore.codes.length > 0
})

watch(
  () => isUserWalletConnected,
  (newIsUserWalletConnected) => {
    if (!newIsUserWalletConnected) {
      isUserConnectedProcessCompleted.value = false
    }
  }
)

onMounted(() => {
  if (isUserWalletConnected) {
    isUserConnectedProcessCompleted.value = true
  }
})

function handleSidebarToggle() {
  if (props.isSidebarOpen) {
    return emit('sidebar:closed')
  }

  emit('sidebar:opened')
}

function handleShowNinjaPassModal() {
  modalStore.openModal({ type: Modal.NinjaPassWinner })

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
      @click="router.push({ name: 'index' })"
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
          v-if="isUserWalletConnected && hasNinjaPassCodes"
          class="flex px-0 w-10 items-center justify-center"
          @click="handleShowNinjaPassModal"
        >
          <BaseIcon name="gift" class="text-white w-4 h-4" />
        </LayoutNavItemDummy>

        <LayoutNavItem
          v-if="isUserWalletConnected"
          class="hidden lg:flex"
          data-cy="header-activity-link"
          :to="{ name: 'activity' }"
        >
          {{ $t('navigation.activity') }}
        </LayoutNavItem>

        <LayoutNavItem
          v-if="isUserWalletConnected"
          class="hidden lg:flex"
          data-cy="header-account-link"
          :to="{ name: 'account' }"
        >
          {{ $t('navigation.account') }}
        </LayoutNavItem>

        <LayoutWallet />
      </div>
    </div>
    <button
      class="px-4 border-r border-gray-600 text-gray-200 lg:hidden"
      @click.stop="handleSidebarToggle"
    >
      <BaseIcon v-if="isSidebarOpen" name="close" class="w-6 h-6" />
      <BaseIcon v-else name="menu" class="w-6 h-6" />
    </button>
  </header>
</template>
