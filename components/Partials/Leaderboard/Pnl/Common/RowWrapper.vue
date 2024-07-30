<template>
  <div class="pl-3 md:pl-7 text-left col-span-1">
    <slot name="column1" />
  </div>

  <div class="text-left col-span-2 md:col-span-4">
    <slot name="column2" />
  </div>

  <div class="text-right md:text-left col-span-2 mr-0.5">
    <slot name="column3" />
  </div>
</template>
