<script lang="ts" setup>
import { BigNumberInBase } from '@injectivelabs/utils'
import { PropType } from 'nuxt/dist/app/compat/capi'
import { UiSpotMarketWithToken } from '@injectivelabs/sdk-ui-ts'
import { Modal } from '@/types'
import { UI_DEFAULT_MIN_DISPLAY_DECIMALS } from '@/app/utils/constants'

const props = defineProps({
  baseAmount: {
    type: Object as PropType<BigNumberInBase>,
    required: true
  },

  market: {
    type: Object as PropType<UiSpotMarketWithToken>,
    required: true
  },

  margin: {
    type: String,
    required: true
  },

  quoteAmount: {
    type: Object as PropType<BigNumberInBase>,
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

const { valueToString: marginToString } = useBigNumberFormatter(
  computed(() => props.margin),
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
    is-sm
    @modal:closed="onModalClose"
  >
    <template #title>
      <h3>{{ $t('sgt.saveOnFees') }}</h3>
    </template>

    <div>
      <p class="text-sm text-gray-300">
        {{
          $t('sgt.balancedFeesMessage', {
            quote: market.quoteToken.symbol,
            base: market.baseToken.symbol,
            quoteAmount: quoteAmountToString,
            baseAmount: baseAmountToString,
            initialInvestment: marginToString
          })
        }}
        <NuxtLink
          to="https://helixapp.zendesk.com/hc/en-us/articles/8057142539023-Spot-Grid-Trading-on-Helix-"
          target="_blank"
          class="text-blue-500 hover:text-blue-300 font-semibold"
        >
          {{ $t('sgt.learnMoreHere') }}
        </NuxtLink>
      </p>

      <div class="flex items-center justify-between mt-4">
        <p class="text-gray-500">{{ $t('sgt.totalAmount') }}</p>
        <p>{{ marginToString }} USD</p>
      </div>

      <div class="flex justify-between">
        <p class="text-gray-500">{{ $t('sgt.optimizedAmounts') }}</p>

        <div class="text-gray-500 text-right">
          <p>{{ quoteAmountToString }} {{ market.quoteToken.symbol }}</p>
          <p>{{ baseAmountToString }} {{ market.baseToken.symbol }}</p>
        </div>
      </div>

      <div class="grid grid-cols-1 gap-2 mt-6">
        <AppButton
          is-lg
          class="w-full font-semibold shadow-none select-none bg-blue-500"
          @click="onChangeInvestmentType"
        >
          {{
            $t('sgt.useFeeOptimizedAmounts', {
              quote: market.quoteToken.symbol,
              base: market.baseToken.symbol
            })
          }}
        </AppButton>

        <AppButton
          is-lg
          class="w-full font-semibold shadow-none select-none bg-transparent border-white focus:border-white hover:bg-white/10"
          @click="onCreateStrategy"
        >
          {{ $t('sgt.keepOriginalAmounts') }}
        </AppButton>
      </div>
    </div>
  </AppModal>
</template>
