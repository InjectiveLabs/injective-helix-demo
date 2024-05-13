<script setup lang="ts">
import { TokenStatic } from '@injectivelabs/token-metadata'

const props = defineProps({
  token: {
    type: Object as PropType<TokenStatic>,
    required: true
  }
})

const emit = defineEmits<{
  'set:token': [token: TokenStatic]
}>()

function setToken() {
  emit('set:token', props.token)
}
</script>

<template>
  <div class="flex p-2 hover:bg-brand-800 cursor-pointer" @click="setToken">
    <div class="flex items-center px-1">
      <CommonTokenIcon v-bind="{ token }" />
    </div>

    <div class="px-2">
      <p class="font-semibold text-sm">{{ token.symbol }}</p>
      <p class="text-gray-500 text-xs">{{ token.name }}</p>
    </div>
  </div>
</template>
