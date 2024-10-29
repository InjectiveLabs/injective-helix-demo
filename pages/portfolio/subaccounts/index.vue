<script setup lang="ts">
import { NuxtUiIcons } from '@shared/types'
import { Modal } from '@/types'

const modalStore = useModalStore()
const sharedWalletStore = useSharedWalletStore()

const isDisabled = computed(
  () =>
    sharedWalletStore.isAuthzWalletConnected ||
    sharedWalletStore.isAutoSignEnabled
)

function openTransferModal() {
  modalStore.openModal(Modal.SubaccountTransfer)
}
</script>

<template>
  <div>
    <div class="p-4">
      <h2 class="portfolio-title">
        {{ $t('navigation.subaccounts') }}
      </h2>

      <p class="text-xs font-xs text-coolGray-400 max-w-xl mt-2">
        {{ $t('portfolio.subaccounts.description') }}
      </p>
    </div>

    <div class="p-4 flex justify-end">
      <AppButton
        :tooltip="
          isDisabled ? $t('common.notAvailableinAuthZOrAutoSignMode') : ''
        "
        :disabled="isDisabled"
        size="sm"
        class="space-x-2"
        @click="openTransferModal"
      >
        <UIcon :name="NuxtUiIcons.Plus" class="h-3.5 w-3.5 min-w-3.5" />
        <span>{{ $t('portfolio.subaccounts.addSubaccountOrTransfer') }}</span>
      </AppButton>
    </div>

    <div class="divide-y border-y">
      <PartialsPortfolioSubaccountsTableHeader />
      <CommonSubaccountOptions
        :include-bots-subaccounts="true"
        :show-low-balance="true"
      >
        <template #default="{ subaccountOptions }">
          <PartialsPortfolioSubaccountsTableRow
            v-for="subaccount in subaccountOptions"
            :key="subaccount.value"
            v-bind="{ subaccount }"
          />
        </template>
      </CommonSubaccountOptions>
    </div>

    <ModalsSubaccountTransfer />
  </div>
</template>
