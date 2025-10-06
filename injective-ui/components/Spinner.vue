<template>
  <div class="spinner border-transparent" />
</template>

<style scoped>
@keyframes spin {
  100% {
    transform: rotate(360deg);
  }
}

.spinner {
  @apply block bg-transparent rounded-full top-0 left-0;

  animation: spin 0.8s ease-out infinite;
}

.spinner:not(.m-0) {
  @apply mx-auto;
}
</style>
