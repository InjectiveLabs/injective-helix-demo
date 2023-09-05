<script setup lang="ts">
const { onRemoveStrategy, status, onDetailsPage } = useActiveGridStrategy()
</script>

<template>
  <div class="grid grid-cols-1 gap-4">
    <AppButton
      lg
      class="w-full font-sembold shadow-none select-none bg-green-500 text-white"
      @click="onDetailsPage"
    >
      View Orders
    </AppButton>

    <AppButton
      v-bind="{ status }"
      lg
      class="w-full font-sembold shadow-none select-none bg-transparent border-white focus:border-white hover:bg-white/10"
      @click="onRemoveStrategy"
    >
      End Bot
    </AppButton>
  </div>
</template>
