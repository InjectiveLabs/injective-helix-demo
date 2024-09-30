<script setup lang="ts">
const emit = defineEmits<{
  'modal:close': []
}>()

const isPurchaseFunds = ref(false)

function onPurchaseFunds() {
  isPurchaseFunds.value = true
}

function onCloseModal() {
  emit('modal:close')
}
</script>

<template>
  <PartialsOnboardingFiat
    v-if="!isPurchaseFunds"
    @funds:purchase="onPurchaseFunds"
    @modal:close="onCloseModal"
  />

  <PartialsOnboardingFiatMercuryo v-else />
</template>
