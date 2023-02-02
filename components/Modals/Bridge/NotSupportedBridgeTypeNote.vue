<script lang="ts" setup>
import { PropType } from 'vue'
import { BridgingNetwork } from '@injectivelabs/sdk-ui-ts'
import { getHubUrl } from '@/app/utils/helpers'
import { BridgeField, BridgeForm } from '@/types'
import { usdcTokenDenom } from '@/app/data/token'

const props = defineProps({
  formValues: {
    required: true,
    type: Object as PropType<BridgeForm>
  },

  selectedNetwork: {
    type: Object as PropType<BridgingNetwork>,
    required: true
  }
})

const isWormholeTransfer = computed(
  () =>
    [BridgingNetwork.Solana].includes(props.selectedNetwork) ||
    [usdcTokenDenom.USDCet, usdcTokenDenom.USDCso].includes(
      props.formValues[BridgeField.Denom].toLowerCase()
    )
)

const bridgeUrl = `${getHubUrl()}/bridge`
</script>

<template>
  <div class="mt-4" data-cy="ibc-transfer-modal-note-text-content">
    <div class="flex justify-start items-center">
      <p class="text-xs text-orange-500 ml-2 flex items-center gap-2">
        <BaseIcon name="circle-info" md />
        <span>{{
          $t('bridge.transfersNote', {
            network: isWormholeTransfer
              ? $t('bridge.wormhole')
              : $t('bridge.ibc')
          })
        }}</span>
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
