<script lang="ts" setup>
const props = withDefaults(
  defineProps<{ value: string; modelValue?: string }>(),
  { modelValue: undefined }
)

const isActive = computed(() => props.value === props.modelValue)

const emit = defineEmits<{
  'update:modelValue': [state: string]
}>()

function onClick() {
  emit('update:modelValue', props.value)
}
</script>

<template>
  <div class="relative" @click="onClick">
    <PartialsGuildThumbnail
      is-lg
      class="cursor-pointer"
      :thumbnail-id="value"
      :class="[isActive ? '' : 'opacity-80 hover:opacity-100']"
    />

    <div v-if="isActive">
      <!-- css hack to make check white -->
      <div class="bg-white h-2 w-2 absolute right-1 bottom-1"></div>
      <SharedIcon
        name="check-circle"
        class="text-blue-500 rounded-full absolute bottom-0 right-0"
        is-md
      />
    </div>
  </div>
</template>
