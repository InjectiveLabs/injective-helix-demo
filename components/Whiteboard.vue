<script setup lang="ts">
//
</script>

<template>
  <Teleport to="body">
    <div
      class="fixed right-5 bottom-5 p-5 bg-black/40 backdrop-blur border border-white z-30 h-[50vh] overflow-y-auto"
    >
      <pre class="text-xs">
        <slot />
      </pre>
    </div>
  </Teleport>
</template>
