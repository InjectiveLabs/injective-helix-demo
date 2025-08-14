<script setup lang="ts">
import { NuxtUiIcons, WalletConnectStatus } from '@shared/types'

const sharedWalletStore = useSharedWalletStore()
const { $onError } = useNuxtApp()

const emit = defineEmits<{
  'opt:show': []
  'sso:setLoading': []
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
  emit('sso:setLoading')

  sharedWalletStore
    .connectTurnkeyGoogle()
    .catch($onError)
    .finally(() => {
      sharedWalletStore.walletConnectStatus = WalletConnectStatus.idle
    })
}

function onEmailConnect() {
  emit('opt:show')
  sharedWalletStore.getEmailTurnkeyOTP(email.value).catch($onError)
}
</script>

<template>
  <section>
    <button
      class="bg-black text-coolGray-200 hover:bg-coolGray-950 border-coolGray-600 border w-full rounded-lg p-4 mb-4"
      size="lg"
      @click="onGoogleConnect"
    >
      <div class="flex items-center gap-2 w-full">
        <Icon :name="NuxtUiIcons.GoogleColor" class="w-6 h-6 min-w-6" />
        <span class="font-semibold">{{ $t('connect.sso.google.cta') }}</span>
      </div>
    </button>

    <div class="flex items-center py-2.5 px-2 border rounded-md">
      <AppInput
        v-model="email"
        v-bind="{
          disabled: isLoading,
          isTransparentBg: true,
          placeholder: $t('connect.sso.email.placeholder')
        }"
      />
      <AppButton
        class="disabled:border-coolGray-400 text-white whitespace-nowrap"
        v-bind="{
          disabled: !email || hasError || isLoading,
          variant: hasError ? 'primary-outline' : 'primary'
        }"
        @click="onEmailConnect"
      >
        {{ $t('connect.sso.email.cta') }}
      </AppButton>
    </div>

    <span v-if="hasError" class="capitalize-phrase text-red-500 text-sm mt-2">
      {{ emailErrors[0] }}
    </span>
  </section>
</template>
