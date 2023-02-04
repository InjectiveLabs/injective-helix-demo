<script lang="ts" setup>
import { OrderbookLayout } from '@/types'

const appStore = useAppStore()

const FilterList = [
  OrderbookLayout.Default,
  OrderbookLayout.Buys,
  OrderbookLayout.Sells
]

const orderbookLayoutType = computed({
  get: (): OrderbookLayout => appStore.userState.orderbookLayout,
  set: (orderbookLayout: OrderbookLayout) => {
    appStore.setUserState({
      ...appStore.userState,
      orderbookLayout
    })
  }
})
</script>

<template>
  <div class="flex flex-start items-center gap-2 h-6">
    <AppSelectButton
      v-for="layoutType in FilterList"
      :key="`orderbook-layout-type-${layoutType}`"
      v-model="orderbookLayoutType"
      :value="layoutType"
    >
      <template #default="{ active }">
        <span
          class="w-6 h-6 flex justify-center items-center"
          :class="[active ? 'opacity-100' : 'opacity-30 hover:opacity-100']"
        >
          <img
            v-if="layoutType === OrderbookLayout.Default"
            class="w-3 h-3"
            src="/Orderbook/default.svg"
          />
          <img
            v-else-if="layoutType === OrderbookLayout.Buys"
            class="w-3 h-3"
            src="/Orderbook/buys.svg"
          />
          <img
            v-else-if="layoutType === OrderbookLayout.Sells"
            class="w-3 h-3"
            src="/Orderbook/sells.svg"
          />
        </span>
      </template>
    </AppSelectButton>
  </div>
</template>
