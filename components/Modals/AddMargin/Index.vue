<script lang="ts" setup>
import { BigNumberInWei } from '@injectivelabs/utils'
import { UiPosition, ZERO_IN_BASE } from '@injectivelabs/sdk-ui-ts'
import { BusEvents, Modal } from '@/types'

const accountStore = useAccountStore()
const derivativeStore = useDerivativeStore()
const modalStore = useModalStore()

const position = ref<UiPosition | undefined>(undefined)

const isModalOpen = computed(
  () => modalStore.modals[Modal.AddMarginToPosition] && !!position.value
)

const market = computed(() => {
  if (!position.value) {
    return
  }

  return derivativeStore.markets.find(
    (market) => market.marketId === position.value?.marketId
  )
})

const quoteBalance = computed(() => {
  if (!market.value || !accountStore.subaccount) {
    return ZERO_IN_BASE
  }

  const quoteToken = market.value.quoteToken

  const balance = accountStore.subaccount.balances.find(
    (balance) => balance.denom.toLowerCase() === quoteToken.denom.toLowerCase()
  )

  if (!balance) {
    return ZERO_IN_BASE
  }

  return new BigNumberInWei(balance.availableBalance || 0).toBase(
    quoteToken.decimals
  )
})

onMounted(() => {
  // todo: refactor this to pass position from parent component
  useEventBus<UiPosition>(BusEvents.AddMarginToPosition).on(
    (p) => (position.value = p)
  )
})

function handleModalClose() {
  position.value = undefined

  modalStore.closeModal(Modal.AddMarginToPosition)
}
</script>

<template>
  <AppModal :show="isModalOpen" sm @modal:closed="handleModalClose">
    <template #title>
      <h3>
        {{ $t('trade.add_margin_to_position_title') }}
      </h3>
    </template>

    <div v-if="market && quoteBalance" class="relative">
      <div class="flex flex-wrap">
        <div class="px-4 w-full">
          <ModalsAddMarginForm
            :balance="quoteBalance"
            :market="market"
            @modal:close="handleModalClose"
          />
        </div>
      </div>
    </div>
  </AppModal>
</template>
