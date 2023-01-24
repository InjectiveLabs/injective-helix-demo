<script lang="ts" setup>
import { PropType } from 'vue'
import { Token } from '@injectivelabs/token-metadata'
import { BridgeBusEvents, Modal, UiMarketWithToken } from '@/types'

const bankStore = useBankStore()
const modalStore = useModalStore()
const walletStore = useWalletStore()

const props = defineProps({
  market: {
    type: Object as PropType<UiMarketWithToken>,
    required: true
  }
})

const activeStep = computed(() => (bankStore.hasAnyBankBalance ? 2 : 1))

function handleClickOnButton() {
  if (!walletStore.hasEnoughInjForGas) {
    return modalStore.openModal({ type: Modal.InsufficientInjForGas })
  }

  useEventBus<Token>(BridgeBusEvents.Transfer).emit(props.market.quoteToken)

  modalStore.openModal({
    type: Modal.Bridge
  })
}
</script>

<template>
  <div>
    <AppButton
      class="w-full rounded bg-blue-500 text-blue-900"
      @click="handleClickOnButton"
    >
      <span v-if="activeStep === 1" data-cy="onboarding-banner-deposit-button">
        {{ $t('common.deposit') }}
      </span>
      <span
        v-else-if="activeStep === 2"
        data-cy="onboarding-banner-transfer-button"
      >
        {{ $t('marketPage.transferToTrade') }}
      </span>
      <span v-else data-cy="onboarding-banner-trade-button">{{
        $t('common.trade')
      }}</span>
    </AppButton>

    <div class="mt-6">
      <AppProgressSteps
        data-cy="onboarding-banner-progress-steps"
        :steps="2"
        :active-step="activeStep"
        :steps-labels="[$t('common.deposit'), $t('common.transfer')]"
        :steps-notes="[
          $t('marketPage.noChainBalanceNote'),
          $t('marketPage.noTradingAccountBalance')
        ]"
      />
    </div>
  </div>
</template>
