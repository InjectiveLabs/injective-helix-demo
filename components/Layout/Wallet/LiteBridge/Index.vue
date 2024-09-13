<script setup lang="ts">
enum View {
  Widget = 'widget',
  Processing = 'processing',
  Success = 'success'
}

const view = ref<View>(View.Widget)

const emit = defineEmits<{
  'modal:lock': []
  'modal:unlock': []
}>()

function onSuccess() {
  view.value = View.Processing
  emit('modal:lock')
}

function onTransferSuccess() {
  view.value = View.Success
  emit('modal:unlock')
}
</script>

<template>
  <PartialsOnboardingLiteBridgeWidget
    v-if="view === View.Widget"
    @success="onSuccess"
  />

  <PartialsOnboardingLiteBridgeWidgetProcessing
    v-if="view === View.Processing"
    @transfer:success="onTransferSuccess"
  />

  <PartialsOnboardingLiteBridgeWidgetSuccess v-if="view === View.Success" />
</template>
