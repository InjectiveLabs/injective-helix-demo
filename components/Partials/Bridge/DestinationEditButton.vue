<script lang="ts" setup>
import { BridgeForm } from '@/types'

const walletStore = useWalletStore()
const bridgeFormValues = useFormValues<BridgeForm>() as Ref<BridgeForm>

const props = defineProps({
  isEditing: Boolean,

  walletAddress: {
    type: String,
    required: true
  }
})

const emit = defineEmits<{
  'address:changed': [address: string]
  'isEditing:changed': [isEditing: boolean]
}>()

const { isCosmosNetworkDestination, isEthereumDestination } =
  useBridgeState(bridgeFormValues)

const wallet = computed(() => {
  if (isEthereumDestination.value) {
    return walletStore.wallet
  }

  if (isCosmosNetworkDestination.value && walletStore.isCosmosWallet) {
    return walletStore.wallet
  }

  return undefined
})

const handlerFunction = computed(() =>
  props.isEditing ? useAddress : editAddress
)

function editAddress() {
  emit('isEditing:changed', true)
  emit('address:changed', '')
}

function useAddress() {
  emit('isEditing:changed', false)
  emit('address:changed', props.walletAddress)
}
</script>

<template>
  <div class="flex">
    <AppButton
      class="bg-primaryLight text-primary-500 flex-shrink-0"
      is-xs
      @click="handlerFunction"
    >
      <div class="flex items-center gap-2">
        <span v-if="!isEditing"> {{ $t('bridge.editAddress') }}</span>
        <span v-else>{{ $t('bridge.useMyAddress') }}</span>
        <BaseIcon
          v-if="wallet"
          :key="wallet"
          :name="`wallet/${wallet}`"
          class="h-4 w-4"
        />
      </div>
    </AppButton>
  </div>
</template>
