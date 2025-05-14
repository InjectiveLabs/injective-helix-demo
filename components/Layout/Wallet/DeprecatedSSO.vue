<script setup lang="ts">
import { Status, StatusType } from '@injectivelabs/utils'
import { MagicProvider } from '@injectivelabs/wallet-base'
import { NuxtUiIcons, WalletConnectStatus } from '@shared/types'
import { DEPRECATED_WALLET_DOCS_LINK } from '@/app/utils/constants'

const sharedWalletStore = useSharedWalletStore()
const { $onError } = useNuxtApp()

const { value: email, errors: emailErrors } = useStringField({
  name: 'email',
  rule: 'required|email'
})

const status = reactive(new Status(StatusType.Idle))

const hasError = computed(() => emailErrors.value.length > 0)

const isLoading = computed(
  () => sharedWalletStore.walletConnectStatus === WalletConnectStatus.connecting
)

function onGoogleConnect() {
  status.setLoading()

  sharedWalletStore
    .connectMagic(MagicProvider.Google)
    .catch($onError)
    .finally(() => status.setIdle())
}

function onEmailConnect() {
  status.setLoading()

  sharedWalletStore
    .connectMagic(MagicProvider.Email, email.value)
    .catch($onError)
    .finally(() => status.setIdle())
}
</script>

<template>
  <AppHocLoading v-bind="{ status }">
    <section>
      <button
        class="bg-black text-coolGray-200 hover:bg-coolGray-950 border-coolGray-600 border w-full rounded-lg p-4"
        size="lg"
        @click="onGoogleConnect"
      >
        <div class="flex items-center gap-2 w-full">
          <Icon :name="NuxtUiIcons.GoogleColor" class="w-6 h-6 min-w-6" />
          <span class="font-semibold">{{ $t('connect.sso.google.cta') }}</span>
        </div>
      </button>

      <div
        class="flex items-center text-orange-500 gap-2 text-xs my-4 bg-orange-500 rounded-lg bg-opacity-10 p-2"
      >
        <UIcon :name="NuxtUiIcons.WarningOutline" class="min-w-5 min-h-5" />
        <p>
          {{ $t('connect.deprecate.description') }}
          <NuxtLink
            target="_blank"
            :to="DEPRECATED_WALLET_DOCS_LINK"
            class="text-orange-400 cursor-pointer hover:text-opacity-80 underline underline-offset-2"
          >
            {{ $t('common.link') }}
          </NuxtLink>
        </p>
      </div>

      <div class="flex items-center py-2.5 px-2 border rounded-md">
        <AppInput
          v-model="email"
          v-bind="{
            isTransparentBg: true,
            placeholder: $t('connect.sso.email.placeholder'),
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
          {{ $t('connect.sso.email.cta') }}
        </AppButton>
      </div>

      <span v-if="hasError" class="capitalize-phrase text-red-500 text-sm mt-2">
        {{ emailErrors[0] }}
      </span>
    </section>
  </AppHocLoading>
</template>
