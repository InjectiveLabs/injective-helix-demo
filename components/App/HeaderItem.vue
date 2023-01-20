<template>
  <th v-bind="$attrs">
    <div class="flex cursor-pointer items-center gap-2" :class="$attrs.class">
      <slot name="prefix" />
      <slot />
    </div>
  </th>
</template>
