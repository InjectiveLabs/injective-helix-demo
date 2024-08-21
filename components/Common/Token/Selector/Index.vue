<script setup lang="ts">
import { TokenStatic } from '@injectivelabs/sdk-ts'

const props = withDefaults(defineProps<{ tokens: TokenStatic[] }>(), {
  tokens: () => []
})

const emit = defineEmits<{
  'set:token': [token: TokenStatic]
}>()

const search = ref('')

const tokensFiltered = computed(() => {
  return props.tokens.filter(
    (token) =>
      token.symbol.toLowerCase().includes(search.value.toLowerCase()) ||
      token.name.toLowerCase().includes(search.value.toLowerCase())
  )
})

onMounted(() => {
  document.getElementById('search-token')?.focus()
})

function setToken(token: TokenStatic) {
  emit('set:token', token)
}
</script>

<template>
  <div class="flex flex-1 flex-col overflow-hidden">
    <div class="flex p-2 border-b">
      <div class="flex items-center p-2">
        <SharedIcon name="search" />
      </div>

      <input
        id="search-token"
        v-model="search"
        type="text"
        class="bg-transparent focus:outline-none p-2 rounded-md"
        placeholder="Search..."
        autocomplete="off"
      />
    </div>

    <div class="overflow-y-auto flex-1 md:max-h-[400px]">
      <div
        v-for="token in tokensFiltered"
        :key="`${token.denom}-${token.symbol}`"
      >
        <CommonTokenSelectorItem v-bind="{ token }" @set:token="setToken" />
      </div>
    </div>
  </div>
</template>
