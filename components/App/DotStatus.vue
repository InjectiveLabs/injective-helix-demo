<script lang="ts" setup>
defineProps({
  isActive: Boolean
})
</script>

<template>
  <div class="flex items-center gap-1 capitalize">
    <BaseIcon
      name="circle"
      :class="[isActive ? 'text-green-500' : 'text-gray-500']"
      is-xs
    />
    <span class="text-sm">
      {{ $t(`common.${isActive ? 'active' : 'inactive'}`) }}
    </span>
  </div>
</template>
