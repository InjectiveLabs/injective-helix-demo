<script lang="ts" setup>
import { upcomingMarkets } from '@/app/data/market'
import { getBridgeUrl } from '@/app/utils/network'
import { Modal, MainPage } from '@/types'

const modalStore = useModalStore()
const router = useRouter()

const [upcomingMarket] = upcomingMarkets
const baseTokenSymbol = upcomingMarket.baseToken.symbol
const quoteTokenSymbol = upcomingMarket.quoteToken.symbol

const bridgeUrl = computed(() => `${getBridgeUrl()}/?denom=${baseTokenSymbol}`)
const isModalOpen = computed(() => modalStore.modals[Modal.MarketNew])

function closeModal() {
  modalStore.closeModal(Modal.MarketNew)
  router.push({ name: MainPage.Index })
}

function onModalClose() {
  closeModal()
}
</script>

<template>
  <AppModal :is-open="isModalOpen" is-sm @modal:closed="onModalClose">
    <template #title>
      <h3 class="text-base">
        {{ $t('marketNew.title') }}
      </h3>
    </template>

    <div>
      <i18n-t
        keypath="marketNew.description"
        tag="p"
        class="text-center text-sm text-white"
      >
        <template #baseSymbol>
          <span>{{ baseTokenSymbol }}</span>
        </template>
        <template #quoteSymbol>
          <span>{{ quoteTokenSymbol }}</span>
        </template>
      </i18n-t>

      <div class="mt-6 flex items-center justify-center">
        <NuxtLink :to="bridgeUrl" target="_blank">
          <AppButton is-lg class="text-blue-900 bg-blue-500">
            <div class="flex items-center justify-center">
              <span class="mr-2 font-semibold">
                {{ $t('marketNew.depositNow') }}
              </span>
              <SharedIcon name="external-link" class="w-3 h-3" />
            </div>
          </AppButton>
        </NuxtLink>
      </div>
    </div>
  </AppModal>
</template>
