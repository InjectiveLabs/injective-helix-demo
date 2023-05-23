<script lang="ts" setup>
import { PropType } from 'vue'
import type { Token } from '@injectivelabs/token-metadata'
import { Status, StatusType } from '@injectivelabs/utils'
import { usdcTokenDenom } from '@/app/data/token'
import { AccountBalance, BusEvents, Modal } from '@/types'

const modalStore = useModalStore()

const props = defineProps({
  hideBalances: Boolean,
  isHoldingSingleUsdcDenom: Boolean,

  balance: {
    type: Object as PropType<AccountBalance>,
    required: true
  },

  usdPriceStatus: {
    type: Object as PropType<Status>,
    default: new Status(StatusType.Loading)
  }
})

const showConvertModalLink = computed(() => {
  return props.balance.denom === usdcTokenDenom.USDC
})

function handleConvert() {
  useEventBus<Token>(BusEvents.ConvertUsdc).emit(props.balance.token as Token)

  modalStore.openModal({ type: Modal.ConvertUsdc })
}
</script>

<template>
  <PartialsAccountBalancesRowWrapper
    v-bind="{
      balance,
      hideBalances,
      usdPriceStatus
    }"
  >
    <template #tokenSymbol>
      <PartialsAccountBalancesRowTokenSymbol v-bind="{ balance }">
        <template v-if="!isHoldingSingleUsdcDenom" #token>
          <div class="pl-6"></div>
        </template>

        <template #symbolSuffix>
          <PartialsAccountBalancesAggregatedLabel
            v-bind="{
              balance
            }"
          />
        </template>
      </PartialsAccountBalancesRowTokenSymbol>
    </template>

    <template v-if="showConvertModalLink" #action>
      <div
        class="rounded flex items-center justify-center w-auto h-auto cursor-pointer"
        data-cy="wallet-balance-convert"
        @click="handleConvert"
      >
        <span class="text-blue-500 text-sm font-medium">
          {{ $t('account.convertUsdc') }}
        </span>
      </div>
    </template>
  </PartialsAccountBalancesRowWrapper>
</template>
