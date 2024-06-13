<script setup lang="ts">
const appStore = useAppStore()

const value = computed({
  get: () => appStore.userState.preferences.showGridTradingSubaccounts,
  set: (value) =>
    appStore.setUserState({
      ...appStore.userState,
      preferences: {
        ...appStore.userState.preferences,
        showGridTradingSubaccounts: value
      }
    })
})
</script>

<template>
  <div class="p-4 flex items-center space-x-4">
    <AppSwitch v-model="value" />
    <p class="text-sm font-semibold">
      {{ $t('portfolio.settings.preferences.showGridTradingSubaccounts') }}
    </p>
  </div>
</template>
