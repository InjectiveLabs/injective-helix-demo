<script lang="ts" setup>
import { NuxtUiIcons } from '@shared/types'
import { BusEvents, NoticeBanner, PortfolioSubPage } from '@/types'

const appStore = useAppStore()

function closeNoticeBanner() {
  appStore.setUserState({
    ...appStore.userState,
    bannersViewed: [
      ...appStore.userState.bannersViewed,
      NoticeBanner.neptuneUsdt
    ]
  })
}

function openNeptuneUsdtModal() {
  useEventBus(BusEvents.NeptuneUsdt).emit()
  closeNoticeBanner()
}
</script>

<template>
  <div
    class="relative z-10 flex justify-center items-center bg-blue-500 text-blue-900 px-3 py-2 border-b"
  >
    <i18n-t
      keypath="trade.neptuneUsdt.banner"
      tag="p"
      class="font-semibold text-sm md:text-md flex-1 text-center"
    >
      <template #here>
        <NuxtLink
          :to="{
            name: PortfolioSubPage.Balances,
            query: {
              depositUsdt: 'true'
            }
          }"
          class="hover:opacity-50 underline cursor-pointer"
          @click="openNeptuneUsdtModal"
        >
          {{ $t('trade.neptuneUsdt.here') }}
        </NuxtLink>
      </template>
    </i18n-t>

    <UIcon
      :name="NuxtUiIcons.Close"
      class="hover:text-white h-4 w-4 min-w-4 cursor-pointer"
      @click="closeNoticeBanner"
    />
  </div>
</template>
