<script setup lang="ts">
import { Modal } from '~/types'
const tokenStore = useTokenStore()
const modalStore = useModalStore()
const walletStore = useWalletStore()

useForm<{ address: string }>()

const { value: address, errorMessage } = useStringField({
  name: 'address',
  rule: 'required|injAddress'
})

const amount = ref(200)
const isClaimed = ref(false)
const sucessfulyClaimed = ref(false)

const token = computed(() =>
  tokenStore.tokens.find((token) => token.symbol === 'PYTH')
)

watch(
  () => walletStore.isUserWalletConnected,
  () => {
    if (walletStore.isUserWalletConnected) {
      address.value = walletStore.injectiveAddress
    }
  },
  { immediate: true }
)

function connect() {
  modalStore.openModal(Modal.Connect)
}
</script>

<template>
  <div class="pt-8 lg:pt-16">
    <div class="max-w-lg mx-auto">
      <div class="flex items-center justify-center space-x-4 mb-8">
        <CommonTokenIcon v-if="token" v-bind="{ token }" is-lg />
        <h2 class="text-3xl font-bold">{{ $t('pyth.pythAirdrop') }}</h2>
      </div>

      <p class="text-xl mb-8">
        {{ $t('pyth.title') }}
      </p>

      <div
        v-if="!walletStore.isUserWalletConnected"
        class="flex justify-center mb-8"
      >
        <AppButton class="bg-blue-500 text-black" @click="connect">
          {{ $t('connect.connectWallet') }}
        </AppButton>
      </div>

      <div v-else>
        <div class="mb-8">
          <label class="border rounded-md p-2 flex">
            <input
              v-model="address"
              type="text"
              class="bg-transparent focus:outline-none flex-1 p-2"
            />

            <div class="flex items-center" @click.stop>
              <AppButton class="bg-blue-500 text-black">
                {{ $t('pyth.check') }}
              </AppButton>
            </div>
          </label>
          <p class="text-red-500">{{ errorMessage }}</p>
        </div>

        <div v-if="isClaimed" class="text-center text-xl mb-8">
          <p>{{ $t('pyth.alreadyClaimed') }}</p>
        </div>

        <div v-if="amount === 0" class="text-center text-xl mb-8">
          {{ $t('pyth.notEligible') }}
        </div>

        <div v-if="amount > 0">
          <div class="text-center text-green-500 text-xl mb-8">
            {{ $t('pyth.congrats', { amount }) }}
          </div>

          <div class="flex justify-center mb-8">
            <AppButton class="bg-blue-500 text-black">
              {{ $t('pyth.claim', { amount }) }}
            </AppButton>
          </div>
        </div>

        <div v-if="sucessfulyClaimed" class="text-center text-xl mb-8">
          {{ $t('pyth.claimed', { amount }) }}
        </div>
      </div>
    </div>
  </div>
</template>
