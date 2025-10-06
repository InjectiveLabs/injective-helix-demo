<script setup lang="ts">
import { Modal } from '@/types'
import type { TokenStatic } from '@injectivelabs/sdk-ts'

const modalStore = useSharedModalStore()

const search = ref('')
const showUnverifiedAssets = ref(false)

const selectedToken = ref<undefined | TokenStatic>(undefined)

function resetSelectedTrade() {
  selectedToken.value = undefined
}

function onShareToken(token: TokenStatic) {
  selectedToken.value = token
  modalStore.openModal(Modal.ShareBalancePnl)
}
</script>

<template>
  <div class="border-t divide-y">
    <PartialsPortfolioBalancesSubaccountTabs
      v-model:search="search"
      v-model:show-unverified-assets="showUnverifiedAssets"
    />

    <div class="overflow-x-auto">
      <div class="lg:min-w-[1100px] divide-y">
        <PartialsPortfolioBalancesSubaccountTable
          v-bind="{ search, showUnverifiedAssets }"
          @balance:share="onShareToken"
        />
      </div>
    </div>

    <ModalsSharePnlSpotBalance
      v-if="selectedToken"
      v-bind="{ token: selectedToken }"
      @on:close="resetSelectedTrade"
    />
  </div>
</template>
