<template>
  <div class="min-h-xs flex-auto">
    <div class="grid grid-cols-12 z-10">
      <slot name="actions" />
    </div>

    <div class="h-full">
      <div class="h-full relative overflow-y-auto">
        <slot></slot>
      </div>
    </div>
  </div>
</template>
