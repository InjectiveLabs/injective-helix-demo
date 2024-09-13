<script setup lang="ts">
type View = 'widget' | 'processing' | 'success'

const view = ref<View>('widget')

const emit = defineEmits<{
  'modal:lock': []
  'modal:unlock': []
}>()

function onSuccess() {
  view.value = 'processing'
  emit('modal:lock')
}

function onTransferSuccess() {
  view.value = 'success'
  emit('modal:unlock')
}
</script>

<template>
  <PartialsOnboardingLiteBridgeWidget
    v-if="view === 'widget'"
    @success="onSuccess"
  />

  <PartialsOnboardingLiteBridgeWidgetProcessing
    v-if="view === 'processing'"
    @transfer:success="onTransferSuccess"
  />

  <PartialsOnboardingLiteBridgeWidgetSuccess v-if="view === 'success'" />
</template>
