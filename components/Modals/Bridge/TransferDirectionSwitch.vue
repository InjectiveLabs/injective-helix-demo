<script setup lang="ts">
import {
  BridgeForm,
  BridgeField,
  TransferDirection,
  TransferSide
} from '@/types'
import { transferSideMeta } from '@/app/data/bridge'

const formValues = useFormValues<BridgeForm>()

const originNetworkMeta = computed(() =>
  formValues.value[BridgeField.TransferDirection] ===
  TransferDirection.bankToTradingAccount
    ? transferSideMeta[TransferSide.Bank]
    : transferSideMeta[TransferSide.TradingAccount]
)

const destinationNetworkMeta = computed(() =>
  formValues.value[BridgeField.TransferDirection] ===
  TransferDirection.bankToTradingAccount
    ? transferSideMeta[TransferSide.TradingAccount]
    : transferSideMeta[TransferSide.Bank]
)

function handleDirectionSwitch() {
  const updatedTransferDirection =
    formValues.value[BridgeField.TransferDirection] ===
    TransferDirection.bankToTradingAccount
      ? TransferDirection.tradingAccountToBank
      : TransferDirection.bankToTradingAccount

  formValues.value[BridgeField.TransferDirection] = updatedTransferDirection
}
</script>

<template>
  <div class="flex justify-between items-center">
    <ModalsBridgeNetworkCard
      class="w-1/2"
      hide-icon
      data-cy="transfer-modal-from-text-content"
      :network-meta="originNetworkMeta"
    />

    <div
      class="bg-blue-500 min-w-6 h-6 mx-6 flex items-center justify-center rounded-full cursor-pointer"
      data-cy="transfer-modal-direction-toggle-button"
    >
      <BaseIcon
        name="arrow"
        swap
        class="text-gray-1000 w-6 h-6 rotate-180 select-none"
        @click="handleDirectionSwitch"
      />
    </div>

    <ModalsBridgeNetworkCard
      class="w-1/2"
      hide-icon
      data-cy="transfer-modal-to-text-content"
      :network-meta="destinationNetworkMeta"
    />
  </div>
</template>
