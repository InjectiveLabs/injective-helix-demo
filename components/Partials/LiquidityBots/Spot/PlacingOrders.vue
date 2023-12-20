<script lang="ts" setup>
const props = defineProps({
  subaccountId: {
    type: String,
    required: true
  }
})

const spotStore = useSpotStore()

useIntervalFn(() => {
  spotStore.fetchSubaccountOrderHistory({ subaccountId: props.subaccountId })
}, 2000)
</script>

<template>
  <div class="flex flex-col items-center px-2 py-4">
    <p class="text-md font-bold">{{ $t('liquidity.placingOrders') }}</p>
    <AppHocLoading :is-loading="true" />
  </div>
</template>
