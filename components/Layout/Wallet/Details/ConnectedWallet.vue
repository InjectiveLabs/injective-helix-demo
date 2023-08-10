<script lang="ts" setup>
import { PropType } from 'vue'
import { formatWalletAddress } from '@injectivelabs/utils'
import { Wallet } from '@injectivelabs/wallet-ts'

const walletStore = useWalletStore()
const { copy } = useClipboard()
const { t } = useLang()
const { success } = useNotifications()

defineProps({
  wallet: {
    required: true,
    type: String as PropType<Wallet>
  }
})

const showDropdown = ref(false)

const formattedInjectiveAddress = computed(() =>
  formatWalletAddress(walletStore.injectiveAddress)
)
const formattedAddress = computed(() =>
  formatWalletAddress(walletStore.address)
)

function handleToggleDropdown() {
  showDropdown.value = !showDropdown.value
}

function copyAddress() {
  copy(walletStore.address)
  success({ title: t('connect.copiedAddress') })
}

function copyInjectiveAddress() {
  copy(walletStore.injectiveAddress)
  success({ title: t('connect.copiedAddress') })
}
</script>

<template>
  <div class="flex flex-col text-white">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-2">
        <BaseIcon :name="`wallet/${wallet}`" class="h-6 w-6" />
        <p class="font-mono text-sm font-medium">
          {{ formattedInjectiveAddress }}
        </p>
      </div>
      <div class="flex items-center gap-2">
        <BaseIcon
          name="copy-filled"
          class="hover:text-blue-500 h-4 w-4"
          @click.stop="copyInjectiveAddress"
        />

        <BaseIcon
          name="caret-down"
          class="h-6 w-6 transition duration-500 hover:text-blue-500"
          :class="{ '-rotate-180': showDropdown }"
          @click="handleToggleDropdown"
        />
      </div>
    </div>
    <transition
      enter-active-class="ease-out duration-300"
      enter-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="ease-in duration-200"
      leave-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div v-if="showDropdown" class="ml-8 mt-4 flex flex-col gap-y-2">
        <div class="flex items-center justify-between text-xs">
          <span class="font-semibold">
            {{ $t('connect.walletAddress') }}
          </span>

          <div class="flex items-center gap-2">
            <span>{{ formattedAddress }}</span>
            <BaseIcon
              name="copy-filled"
              class="hover:text-blue-500 h-4 w-4"
              @click="copyAddress"
            />
          </div>
        </div>
        <LayoutWalletDetailsTierLevel />
      </div>
    </transition>
  </div>
</template>
