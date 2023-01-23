<script lang="ts" setup>
import { PropType } from 'vue'
import { Wallet } from '@injectivelabs/wallet-ts'
import { walletConnectedRequiredRouteNames } from '@/nuxt-config/hooks/route'

const route = useRoute()
const router = useRouter()
const walletStore = useWalletStore()

defineProps({
  wallet: {
    type: String as PropType<Wallet>,
    required: true
  }
})

function handleClickOnDisconnect() {
  walletStore.logout()

  if (walletConnectedRequiredRouteNames.includes(route.name as string)) {
    router.push({ name: 'index' })
  }
}
</script>

<template>
  <div class="rounded-lg bg-gray-1000">
    <div class="flex flex-col py-3 px-4">
      <div class="flex justify-between pb-2">
        <span class="text-sm font-semibold text-gray-200">
          {{ $t('navigation.myAccount') }}
        </span>
        <span
          class="text-blue-500 hover:text-opacity-80 cursor-pointer text-xs font-medium"
          @click="handleClickOnDisconnect"
        >
          {{ $t('navigation.disconnect') }}
        </span>
      </div>
      <LayoutWalletDetailsConnectedWallet :wallet="wallet" />
    </div>
  </div>
</template>
