<script lang="ts" setup>
const appStore = useAppStore()
const authZStore = useAuthZStore()
const walletStore = useWalletStore()

function toggleSubaccountManagement() {
  appStore.setUserState({
    ...appStore.userState,
    preferences: {
      ...appStore.userState.preferences,
      subaccountManagement: !appStore.userState.preferences.subaccountManagement
    }
  })
}

function toggleAuthZManagement() {
  const authZManagement = !appStore.userState.preferences.authZManagement

  appStore.setUserState({
    ...appStore.userState,
    preferences: {
      ...appStore.userState.preferences,
      authZManagement
    }
  })

  if (!authZManagement) {
    walletStore.resetAuthZ()

    /**
     * -- TODO --
     * For now, we reload the page to refetch everything on the
     * page but we should add watchers for better UX
     */
    window.location.reload()
  }
}
</script>

<template>
  <div
    class="flex-col p-4 gap-3 pointer-events-none hidden lg:flex lg:pointer-events-auto text-gray-100 text-xs"
  >
    <span class="font-semibold">
      {{ $t('proMode.proMode') }}
    </span>

    <AppCheckbox
      :model-value="appStore.userState.preferences.subaccountManagement"
      @input="toggleSubaccountManagement"
    >
      <span class="text-gray-300">
        {{ $t('proMode.subaccountManagement') }}
      </span>
    </AppCheckbox>
    <AppCheckbox
      v-if="authZStore.hasGranterOrGranteeGrants"
      :model-value="appStore.userState.preferences.authZManagement"
      @input="toggleAuthZManagement"
    >
      <span class="text-gray-300">
        {{ $t('proMode.authzManagement') }}
      </span>
    </AppCheckbox>
  </div>
</template>
