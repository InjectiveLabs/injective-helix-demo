<script lang="ts" setup>
import { PropType } from 'vue'
import { BridgingNetwork, CosmosNetworks } from '@injectivelabs/sdk-ui-ts'
import { getHubUrl } from '@/app/utils/helpers'

const props = defineProps({
  selectedNetwork: {
    type: String as PropType<BridgingNetwork>,
    required: true
  }
})

const bridgeUrl = `${getHubUrl()}/bridge`

const isWormholeTransfer = computed(
  () =>
    [BridgingNetwork.Solana].includes(props.selectedNetwork) ||
    [BridgingNetwork.EthereumWh].includes(props.selectedNetwork)
)

const isIbcTransfer = computed(() =>
  CosmosNetworks.includes(props.selectedNetwork)
)
</script>

<template>
  <div class="mt-4" data-cy="ibc-transfer-modal-note-text-content">
    <div class="flex justify-start items-center">
      <p class="text-xs text-orange-500 ml-2 flex items-center gap-2">
        <BaseIcon name="circle-info" md />
        <span v-if="isWormholeTransfer">
          {{ $t('bridge.transfersNote', { network: $t('bridge.wormhole') }) }}
        </span>
        <span v-else-if="isIbcTransfer">
          {{ $t('bridge.transfersNote', { network: $t('bridge.ibc') }) }}
        </span>
        <span v-else>
          {{ $t('bridge.transfersNote', { network: $t('common.network') }) }}
        </span>
      </p>
    </div>
    <div class="text-center mt-6">
      <NuxtLink :to="bridgeUrl" target="_blank">
        <AppButton
          lg
          class="w-full bg-blue-500 text-blue-900"
          data-cy="ibc-transfer-modal-hub-button"
        >
          <div class="flex items-center justify-center">
            <span class="mr-2">Injective Hub</span>
            <BaseIcon name="external-link" class="w-3 h-3" />
          </div>
        </AppButton>
      </NuxtLink>
    </div>
  </div>
</template>
