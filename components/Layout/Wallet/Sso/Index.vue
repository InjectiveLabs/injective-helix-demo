<script setup lang="ts">
import { NuxtUiIcons, WalletConnectStatus } from '@shared/types'
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
    <button
      class="bg-black text-coolGray-200 hover:bg-coolGray-950 border-coolGray-600 border w-full rounded-lg p-4 mb-4"
      size="lg"
      @click="onGoogleConnect"
    >
      <div class="flex items-center gap-2 w-full">
        <Icon :name="NuxtUiIcons.GoogleColor" class="w-6 h-6 min-w-6" />
        <span class="font-semibold">{{ $t('connect.magic.google.cta') }}</span>
      </div>
    </button>

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
        class="disabled:border-coolGray-400 text-white"
        v-bind="{
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
