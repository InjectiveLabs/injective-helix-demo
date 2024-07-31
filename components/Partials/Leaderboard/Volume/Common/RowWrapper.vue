<script lang="ts" setup>
const isMobile = useIsMobile()
</script>

<template>
  <div class="pl-3 lg:pl-7 text-left col-span-1">
    <slot name="column1" />
  </div>

  <div class="text-left col-span-2 md:col-span-5">
    <slot name="column2" />
  </div>

  <template v-if="!isMobile">
    <div class="text-left col-span-2 mr-0.5">
      <slot name="column3" />
    </div>

    <div class="text-right md:text-left col-span-1 mr-0.5">
      <slot name="column4" />
    </div>
  </template>
  <template v-else>
    <div class="flex flex-col col-span-3 items-end">
      <slot name="column3" />
      <slot name="column4" />
    </div>
  </template>
</template>
