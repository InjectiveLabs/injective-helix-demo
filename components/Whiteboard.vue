<script setup lang="ts">
//
</script>

<template>
  <Teleport to="body">
    <div
      class="fixed bg-gray-900 text-white z-10 border p-2 bottom-2 right-2 max-h-[40vh] overflow-y-auto"
    >
      <slot />
    </div>
  </Teleport>
</template>
