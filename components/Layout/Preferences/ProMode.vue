<script lang="ts" setup>
const appStore = useAppStore()
const authZStore = useAuthZStore()

function toggleSubaccountManagement() {
  appStore.setUserState({
    ...appStore.userState,
    proMode: {
      ...appStore.userState.proMode,
      subaccountManagement: !appStore.userState.proMode.subaccountManagement
    }
  })
}

function toggleAuthZManagement() {
  appStore.setUserState({
    ...appStore.userState,
    proMode: {
      ...appStore.userState.proMode,
      authZManagement: !appStore.userState.proMode.authZManagement
    }
  })
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
      :model-value="appStore.userState.proMode.subaccountManagement"
      @input="toggleSubaccountManagement"
    >
      <span class="text-gray-300">
        {{ $t('proMode.subaccountManagement') }}
      </span>
    </AppCheckbox>
    <AppCheckbox
      v-if="authZStore.hasGranteeGrants"
      :model-value="appStore.userState.proMode.authZManagement"
      @input="toggleAuthZManagement"
    >
      <span class="text-gray-300">
        {{ $t('proMode.authzManagement') }}
      </span>
    </AppCheckbox>
  </div>
</template>
