<script setup lang="ts">
withDefaults(
  defineProps<{
    item: Record<string, string>
  }>(),
  {}
)

const emit = defineEmits<{ copyLink: [] }>()

function copyLink() {
  emit('copyLink')
}
</script>

<template>
  <NuxtLink
    v-if="item.href"
    class="p-4 bg-[#3B3C4E] rounded-2xl text-xl text-white cursor-pointer hover:bg-brand-725 transition-colors"
    :to="item.href"
    target="_blank"
  >
    <UIcon class="block" :name="item.icon" />
  </NuxtLink>
  <div
    v-else
    class="p-4 bg-[#3B3C4E] rounded-2xl text-xl text-white cursor-pointer hover:bg-brand-725 transition-colors"
    @click="copyLink"
  >
    <UIcon class="block" :name="item.icon" />
  </div>
</template>
