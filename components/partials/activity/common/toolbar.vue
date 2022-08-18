<template>
  <div class="flex items-center justify-between gap-4">
    <div class="flex items-center justify-start gap-4">
      <slot name="filters" />
    </div>
    <div class="flex items-center justify-end gap-4">
      <slot name="actions" />
    </div>
  </div>
</template>
