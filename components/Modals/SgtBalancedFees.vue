<script setup lang="ts">
import { BigNumberInBase } from '@injectivelabs/utils'
import { PropType } from 'nuxt/dist/app/compat/capi'
import { Modal } from '@/types'
import { UI_DEFAULT_MIN_DISPLAY_DECIMALS } from '@/app/utils/constants'

const props = defineProps({
  baseAmount: {
    type: Object as PropType<BigNumberInBase>,
    required: true
  },

  quoteAmount: {
    type: Object as PropType<BigNumberInBase>,
    required: true
  },

  margin: {
    type: String,
    required: true
  }
})

const emit = defineEmits<{
  'investment-type:set': []
  'strategy:create': []
}>()

const modalStore = useModalStore()

const { valueToString: baseAmountToString } = useBigNumberFormatter(
  computed(() => props.baseAmount),
  { decimalPlaces: UI_DEFAULT_MIN_DISPLAY_DECIMALS }
)

const { valueToString: quoteAmountToString } = useBigNumberFormatter(
  computed(() => props.quoteAmount),
  { decimalPlaces: UI_DEFAULT_MIN_DISPLAY_DECIMALS }
)

function onModalClose() {
  modalStore.closeModal(Modal.SgtBalancedFees)
}

function onCreateStrategy() {
  emit('strategy:create')
  onModalClose()
}

function onChangeInvestmentType() {
  emit('investment-type:set')
  onModalClose()
}
</script>

<template>
  <AppModal
    :is-open="modalStore.modals[Modal.SgtBalancedFees]"
    sm
    @modal:closed="onModalClose"
  >
    <template #title>
      <h3>{{ $t('sgt.includeDenom') }}</h3>
    </template>

    <div>
      <div>
        <div>
          {{ $t('sgt.balancedFeesMessage') }}
        </div>
        <NuxtLink to="/" class="hover:text-blue-500 underline">
          {{ $t('sgt.learnMoreHere') }}
        </NuxtLink>
      </div>

      <div class="flex items-center justify-between mt-4">
        <p class="text-gray-500">{{ $t('sgt.totalInvestmentAmount') }}</p>
        <p>{{ margin }} USD</p>
      </div>

      <div class="flex justify-between">
        <p class="text-gray-500">{{ $t('sgt.totalInvestmentCurrency') }}</p>

        <div class="text-gray-500 text-right">
          <p>{{ quoteAmountToString }} USD</p>
          <p>{{ baseAmountToString }} INJ</p>
        </div>
      </div>

      <div class="grid grid-cols-1 gap-2 mt-6">
        <AppButton
          lg
          class="w-full font-sembold shadow-none select-none bg-blue-500"
          @click="onChangeInvestmentType"
        >
          {{ $t('sgt.changeToQuoteAndBase') }}
        </AppButton>

        <AppButton
          lg
          class="w-full font-sembold shadow-none select-none bg-transparent border-white focus:border-white hover:bg-white/10"
          @click="onCreateStrategy"
        >
          {{ $t('sgt.keepQuote') }}
        </AppButton>
      </div>
    </div>
  </AppModal>
</template>
