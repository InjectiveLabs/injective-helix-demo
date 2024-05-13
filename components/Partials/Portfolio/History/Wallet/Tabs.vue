<script setup lang="ts">
const tokenStore = useTokenStore()

const { value: tokenValue } = useStringField({
  name: 'token',
  rule: ''
})
</script>

<template>
  <div class="h-header flex">
    <CommonSubaccountTabSelector />

    <div class="flex divide-x border-r">
      <CommonTabTokenSelector
        v-bind="{ tokens: tokenStore.verifiedTokens }"
        v-model="tokenValue"
      />

      <CommonTabFormReset />
    </div>
  </div>
</template>
