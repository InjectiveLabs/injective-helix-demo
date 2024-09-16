<script setup lang="ts">
import { WalletConnectStatus } from '@shared/types'
import { MagicProvider } from '@injectivelabs/wallet-ts'

const sharedWalletStore = useSharedWalletStore()

const { value: email, errors: emailErrors } = useStringField({
  name: 'email',
  rule: 'required|email'
})

const hasError = computed(() => emailErrors.value.length > 0)

const isLoading = computed(
  () => sharedWalletStore.walletConnectStatus === WalletConnectStatus.connecting
)

function onConnect() {
  sharedWalletStore.connectMagic(MagicProvider.Email, email.value)
}
</script>

<template>
  <div>
    <div class="flex items-center py-2.5 px-2 border rounded-md">
      <AppInput
        v-model="email"
        :disabled="isLoading"
        is-transparent-bg
        :placeholder="$t('connect.email.placeholder')"
      />
      <AppButton
        :disabled="!email || hasError"
        :variant="hasError ? 'primary-outline' : 'primary'"
        :is-loading="isLoading"
        @click="onConnect"
      >
        {{ $t('connect.email.cta') }}
      </AppButton>
    </div>

    <span v-if="hasError" class="capitalize-phrase text-red-500 text-sm mt-2">
      {{ emailErrors[0] }}
    </span>
  </div>
</template>
