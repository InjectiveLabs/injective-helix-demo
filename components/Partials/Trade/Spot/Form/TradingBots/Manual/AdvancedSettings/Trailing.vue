<script setup lang="ts">
const isTrailingEnabled = ref(false)
const trailingUpper = ref('')
const trailingLower = ref('')
</script>

<template>
  <div class="p-1 space-y-2">
    <AppCheckbox2 v-model="isTrailingEnabled"> Enable Trailing </AppCheckbox2>

    <div v-if="isTrailingEnabled" class="space-y-2">
      <AppInputField v-model="trailingUpper" :placeholder="$t('sgt.upper')" />

      <AppInputField v-model="trailingLower" :placeholder="$t('sgt.lower')" />
    </div>
  </div>
</template>
