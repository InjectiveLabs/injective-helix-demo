<script setup lang="ts">
import { WalletConnectStatus } from '@shared/types'
import { MagicProvider } from '@injectivelabs/wallet-ts'

const sharedWalletStore = useSharedWalletStore()

const emit = defineEmits<{
  'set:magicStatusLoading': []
}>()

const { value: email, errors: emailErrors } = useStringField({
  name: 'email',
  rule: 'required|email'
})

const hasError = computed(() => emailErrors.value.length > 0)

const isLoading = computed(
  () => sharedWalletStore.walletConnectStatus === WalletConnectStatus.connecting
)

function onGoogleConnect() {
  emit('set:magicStatusLoading')

  sharedWalletStore.connectMagic(MagicProvider.Google)
}

function onEmailConnect() {
  emit('set:magicStatusLoading')

  sharedWalletStore.connectMagic(MagicProvider.Email, email.value)
}
</script>

<template>
  <div>
    <AppButton
      class="text-white w-full mb-4 h-14"
      v-bind="{ size: 'lg', status: googleStatus }"
      @click="onGoogleConnect"
    >
      <div class="flex items-center gap-2 w-full">
        <SharedIcon name="google" />
        <span>{{ $t('connect.magic.google.cta') }}</span>
      </div>
    </AppButton>

    <div class="flex items-center py-2.5 px-2 border rounded-md">
      <AppInput
        v-model="email"
        v-bind="{
          isTransparentBg: true,
          placeholder: $t('connect.magic.email.placeholder'),
          disabled: isLoading
        }"
      />
      <AppButton
        v-bind="{
          class: 'disabled:border-gray-400 text-white',
          status: emailStatus,
          disabled: !email || hasError || isLoading,
          variant: hasError ? 'primary-outline' : 'primary'
        }"
        @click="onEmailConnect"
      >
        {{ $t('connect.magic.email.cta') }}
      </AppButton>
    </div>

    <span v-if="hasError" class="capitalize-phrase text-red-500 text-sm mt-2">
      {{ emailErrors[0] }}
    </span>
  </div>
</template>
