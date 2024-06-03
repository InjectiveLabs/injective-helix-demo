<script setup lang="ts">
const tokenStore = useTokenStore()

const { value: tokenValue } = useStringField({
  name: 'token',
  rule: ''
})

const emit = defineEmits<{
  'token:update': [market: string]
  'form:reset': []
}>()

function onTokenChange(market: string) {
  emit('token:update', market)
}

function onFormReset() {
  emit('form:reset')
}
</script>

<template>
  <div class="h-header flex">
    <CommonSubaccountTabSelector />

    <div class="flex divide-x border-r">
      <CommonTabTokenSelector
        v-bind="{ tokens: tokenStore.verifiedTokens }"
        v-model="tokenValue"
        @update:model-value="onTokenChange"
      />

      <CommonTabFormReset @form:reset="onFormReset" />
    </div>
  </div>
</template>
