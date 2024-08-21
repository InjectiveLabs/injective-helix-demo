<script lang="ts" setup>
withDefaults(
  defineProps<{
    isActive: boolean
    color: string
  }>(),
  {
    isActive: false,
    color: ''
  }
)
</script>

<template>
  <div class="flex items-center gap-1 capitalize">
    <SharedIcon
      name="circle"
      :class="[isActive && !color ? 'text-green-500' : 'text-gray-500', color]"
      is-xs
    />
    <span class="text-sm">
      <slot>
        {{ $t(`common.${isActive ? 'active' : 'inactive'}`) }}
      </slot>
    </span>
  </div>
</template>
