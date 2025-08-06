<script lang="ts" setup>
const props = withDefaults(defineProps<{ item: Record<string, any> }>(), {})

const emit = defineEmits<{
  'on:click': []
  'locale:update': [value: string]
}>()

const { locale } = useLang()

function selectLocale() {
  emit('on:click')
  emit('locale:update', props.item.code)
}
</script>

<template>
  <li
    :class="{ 'text-blue-500': item.code === locale }"
    class="flex items-center justify-between gap-2 p-2 w-full text-sm hover:bg-brand-800 rounded-lg cursor-pointer transition-all"
    @click="selectLocale"
  >
    {{ item.longName }}
  </li>
</template>
