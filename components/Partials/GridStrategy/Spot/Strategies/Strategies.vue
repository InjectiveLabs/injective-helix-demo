<script setup lang="ts">
import { Status, StatusType } from '@injectivelabs/utils'
import { PropType } from 'nuxt/dist/app/compat/capi'

const route = useRoute()
const walletStore = useWalletStore()

defineProps({
  status: {
    type: Object as PropType<Status>,
    default: new Status(StatusType.Loading)
  }
})
</script>

<template>
  <div class="flex flex-col h-full overflow-y-auto min-h-[400px]">
    <div class="p-4 flex text-gray-500 uppercase text-xs font-semibold">
      <BaseNuxtLink
        :to="{
          name: 'trading-bots-grid-spot-market',
          params: { market: route.params.market }
        }"
        exact-active-class="text-blue-500"
      >
        {{ $t('sgt.running') }}
      </BaseNuxtLink>

      <div class="border mx-4" />

      <BaseNuxtLink
        :to="{
          name: 'trading-bots-grid-spot-market-history',
          params: { market: route.params.market }
        }"
        exact-active-class="text-blue-500 font-bold"
      >
        {{ $t('sgt.history') }}
      </BaseNuxtLink>
    </div>

    <CommonCardTableWrap class="flex-1">
      <CommonCard class="h-full flex-auto">
        <div v-if="!walletStore.isUserWalletConnected">
          <CommonUserNotConnectedNote cta />
        </div>

        <AppHocLoading v-else v-bind="{ status }" class="h-full">
          <div class="overflow-auto h-full">
            <NuxtPage />
          </div>
        </AppHocLoading>
      </CommonCard>
    </CommonCardTableWrap>
  </div>
</template>
