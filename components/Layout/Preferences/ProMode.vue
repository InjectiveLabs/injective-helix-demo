<script lang="ts" setup>
const appStore = useAppStore()

function toggleProMode() {
  appStore.setUserState({
    ...appStore.userState,
    proMode: !appStore.userState.proMode
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
      :model-value="appStore.userState.proMode"
      @input="toggleProMode"
    >
      <span class="text-gray-300">
        {{ $t('proMode.proModeNote') }}
      </span>
    </AppCheckbox>
  </div>
</template>
