<script setup lang="ts">
import { Modal, UiSpotMarket } from '@/types'

const modalStore = useSharedModalStore()

const props = withDefaults(
  defineProps<{
    market: UiSpotMarket
    optimizedBaseAmount: number | string
    optimizedQuoteAmount: number | string
  }>(),
  {}
)

const emit = defineEmits<{
  'adjust:strategy': []
}>()

function handleClose() {
  modalStore.closeModal(Modal.OptimizeSgtValues)
}

function handleAdjust() {
  emit('adjust:strategy')
  handleClose()
}

const { valueToString: optimizedBaseAmountToString } =
  useSharedBigNumberFormatter(computed(() => props.optimizedBaseAmount))

const { valueToString: optimizedQuoteAmountToString } =
  useSharedBigNumberFormatter(computed(() => props.optimizedQuoteAmount))
</script>

<template>
  <AppModal
    v-if="optimizedBaseAmount && optimizedQuoteAmount"
    v-model="modalStore.modals[Modal.OptimizeSgtValues]"
    is-sm
  >
    <template #title>
      <h3>
        {{ $t('sgt.optimization.optimizeBalanceTitle') }}
      </h3>
    </template>
    <div>
      <p class="text-sm">
        {{ $t('sgt.optimization.optimizeBalanceBody') }}
      </p>

      <div class="flex justify-between items-center text-sm font-semibold mt-1">
        <p class="text-sm text-coolGray-400">
          {{
            $t('sgt.optimization.adjustYourAvailableBalance', {
              base: props.market.baseToken.symbol.toUpperCase(),
              quote: props.market.quoteToken.symbol.toUpperCase()
            })
          }}
        </p>

        <p class="text-sm text-nowrap uppercase">
          {{ optimizedBaseAmountToString }} {{ market.baseToken.symbol }} /
          {{ optimizedQuoteAmountToString }} {{ market.quoteToken.symbol }}
        </p>
      </div>
    </div>

    <template #footer>
      <div class="flex flex-col gap-2">
        <UButton size="sm" block @click="handleAdjust">
          {{ $t('sgt.optimization.confirmAndAdjust') }}
        </UButton>
        <UButton
          block
          size="sm"
          variant="outline"
          color="red"
          @click="handleClose"
        >
          {{ $t('common.cancel') }}
        </UButton>
      </div>
    </template>
  </AppModal>
</template>
