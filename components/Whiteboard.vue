<script setup lang="ts">
//
</script>

<template>
  <Teleport to="body">
    <div
      class="fixed bottom-2 right-2 p-4 bg-black border rounded-md border-brand-800"
    >
      <pre>
        <slot />
      </pre>
    </div>
  </Teleport>
</template>
