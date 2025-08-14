<script setup lang="ts">
const sharedTokenStore = useSharedTokenStore()

const { value: tokenValue } = useStringField({
  name: 'token',
  rule: ''
})

const emit = defineEmits<{
  'form:reset': []
  'token:update': [market: string]
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
        v-bind="{ tokens: sharedTokenStore.verifiedTokens }"
        v-model="tokenValue"
        @update:model-value="onTokenChange"
      />

      <CommonTabFormReset @form:reset="onFormReset" />
    </div>
  </div>
</template>
