<script lang="ts" setup>
import { Wallet } from '@injectivelabs/wallet-base'
import { DEPRECATED_WALLET_DOCS_LINK } from '@/app/utils/constants'
import { Modal } from '@/types'

const appStore = useAppStore()
const sharedWalletStore = useSharedWalletStore()

const showModal = ref(false)
const dontShowAgain = ref(false)
const shouldShowMagicLoginForm = ref(false)

onHasMagicAccount(() => {
  openModal()
})

onMounted(() => {
  shouldShowMagicLoginForm.value = false
})

function openModal() {
  if (sharedWalletStore.wallet === Wallet.Magic) {
    return
  }

  if (appStore.userState.dontShowAgain.includes(Modal.MigrateMagic)) {
    return
  }

  showModal.value = true
}

function onMigrate() {
  shouldShowMagicLoginForm.value = true
}

function onDontShowAgainToggle() {
  if (dontShowAgain.value) {
    appStore.$patch({
      userState: {
        ...appStore.userState,
        dontShowAgain: [...appStore.userState.dontShowAgain, Modal.MigrateMagic]
      }
    })

    return
  }

  appStore.$patch({
    userState: {
      ...appStore.userState,
      dontShowAgain: appStore.userState.dontShowAgain.filter(
        (item) => item !== Modal.MigrateMagic
      )
    }
  })
}
</script>

<template>
  <AppModal v-model="showModal">
    <section
      v-if="!shouldShowMagicLoginForm"
      class="flex items-center flex-col justify-center mt-8"
    >
      <img src="/svg/sso-deprecated.svg" />

      <h2 class="text-xl font-semibold mb-4 mt-8">
        {{ $t('connect.deprecate.title') }}
      </h2>

      <div class="text-center">
        <p class="text-sm leading-5">
          {{ $t('connect.deprecate.migrateDescription') }}
        </p>

        <div class="mt-4">
          <NuxtLink
            target="_blank"
            :to="DEPRECATED_WALLET_DOCS_LINK"
            class="text-sm leading-5 font-medium text-blue-400 hover:text-opacity-80 cursor-pointer"
          >
            {{ $t('common.learnMore') }}
          </NuxtLink>
        </div>
      </div>

      <div class="w-full mt-10 mb-6">
        <AppButton class="w-full" @click="onMigrate">
          {{ $t('connect.deprecate.cta') }}
        </AppButton>
      </div>

      <AppCheckbox
        v-model="dontShowAgain"
        @update:model-value="onDontShowAgainToggle"
      >
        <div class="text-xs leading-4 tracking-wide text-coolGray-200">
          {{ $t('common.dontShowAgain') }}
        </div>
      </AppCheckbox>
    </section>

    <section v-else class="pt-8 pb-4">
      <LayoutWalletDeprecatedSSO v-if="shouldShowMagicLoginForm" />
    </section>
  </AppModal>
</template>
