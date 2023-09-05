<script setup lang="ts">
import { BigNumberInBase } from '@injectivelabs/utils'
import { PropType } from 'nuxt/dist/app/compat/capi'
import { Modal } from '@/types'

const props = defineProps({
  baseAmount: {
    type: Object as PropType<BigNumberInBase>,
    required: true
  },
  quoteAmount: {
    type: Object as PropType<BigNumberInBase>,
    required: true
  },

  investmentAmount: {
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
  { decimalPlaces: 2 }
)

const { valueToString: quoteAmountToString } = useBigNumberFormatter(
  computed(() => props.quoteAmount),
  { decimalPlaces: 2 }
)

function closeModal() {
  modalStore.closeModal(Modal.SgtBalancedFees)
}

function onCreateStrategy() {
  emit('strategy:create')
  closeModal()
}

function onChangeInvestmentType() {
  emit('investment-type:set')
  closeModal()
}
</script>

<template>
  <AppModal
    :is-open="modalStore.modals[Modal.SgtBalancedFees]"
    sm
    @modal:closed="closeModal"
  >
    <template #title>
      <h3>Include [INJ] in your initial investment</h3>
    </template>

    <div>
      <p>
        You will be saving balancing fees if you invest in both INJ and USDT.
        This is due to we will have to convert some of the USDT to INJ to start
        the strategy. Learn more here.
      </p>

      <div class="flex items-center justify-between mt-4">
        <p class="text-gray-500">Total Investment Amount</p>
        <p>{{ investmentAmount }} USD</p>
      </div>

      <div class="flex justify-between">
        <p class="text-gray-500">Total Investment Currency</p>

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
          Change to USDT + INJ
        </AppButton>

        <AppButton
          lg
          class="w-full font-sembold shadow-none select-none bg-transparent border-white focus:border-white hover:bg-white/10"
          @click="onCreateStrategy"
        >
          Keep USDT Only
        </AppButton>
      </div>
    </div>
  </AppModal>
</template>
