<script lang="ts" setup>
defineProps({
  isModalActive: Boolean
})

const emit = defineEmits<{
  (e: 'update:isModalActive', state: boolean): void
}>()

function closeModal() {
  emit('update:isModalActive', false)
}
</script>

<template>
  <AppModal :show="isModalActive" sm @modal:closed="closeModal">
    <template #title>
      <div class="font-semibold text-base max-h-xs p-2 normal-case ml-2">
        {{ $t('trade.swap.tokenSelector.selectAToken') }}
      </div>
    </template>

    <div>
      <AppSelectTokenList
        class="-mt-8"
        show-balance
        v-bind="$attrs"
        @close="closeModal"
      />
    </div>
  </AppModal>
</template>
