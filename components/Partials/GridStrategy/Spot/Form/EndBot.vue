<script setup lang="ts">
const { onRemoveStrategy, status, onDetailsPage } = useActiveGridStrategy()
</script>

<template>
  <div class="grid grid-cols-1 gap-4">
    <AppButton
      lg
      class="w-full font-sembold shadow-none select-none bg-blue-500 text-black"
      @click="onDetailsPage"
    >
      {{ $t('sgt.viewOrders') }}
    </AppButton>

    <AppButton
      v-bind="{ status }"
      lg
      class="w-full font-sembold shadow-none select-none text-blue-500 border-blue-500"
      @click="onRemoveStrategy"
    >
      {{ $t('sgt.endBot') }}
    </AppButton>
  </div>
</template>
