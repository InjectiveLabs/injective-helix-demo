<template>
  <!-- <div class="flex flex-col sm:flex-row items-center justify-between gap-4 w-full"> -->
  <div class="flex flex-col sm:flex-row justify-between gap-4 w-full">
    <slot name="filters" />
    <slot name="actions" />
  </div>
</template>
