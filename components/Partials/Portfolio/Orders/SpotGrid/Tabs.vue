<script setup lang="ts">
const accountStore = useAccountStore()

const subaccountIds = computed(() =>
  Object.keys(accountStore.subaccountBalancesMap)
)

const subaccount = ref('')
</script>

<template>
  <div class="h-header flex divide-x [&>*]:last:!border-r">
    <CommonFiltersSubaccount v-model="subaccount" v-bind="{ subaccountIds }" />
  </div>
</template>
