<script setup lang="ts">
definePageMeta({
  layout: 'blank'
})
</script>

<template>
  <div v-for="i in 2" :key="i" class="space-y-4 p-4">
    <template
      v-for="size in ['btn-xs', 'btn-sm', 'btn-md', 'btn-lg']"
      :key="size"
    >
      <div class="grid grid-cols-4 gap-4">
        <template
          v-for="color in [
            'btn-primary',
            'btn-danger',
            'btn-primary-outline',
            'btn-danger-outline'
          ]"
          :key="color"
        >
          <div>
            <button :disabled="i === 1" :class="[size, color]">Button</button>
          </div>
        </template>
      </div>
    </template>
  </div>
</template>
