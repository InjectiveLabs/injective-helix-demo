<script lang="ts" setup>
import { BigNumberInBase } from '@injectivelabs/utils'
import { UI_DEFAULT_MIN_DISPLAY_DECIMALS } from '@/app/utils/constants'
import { Modal, UiSpotMarket } from '@/types'

const props = withDefaults(
  defineProps<{
    market: UiSpotMarket
    margin: string
    baseAmount: BigNumberInBase
    quoteAmount: BigNumberInBase
  }>(),
  {}
)

const emit = defineEmits<{
  'investment-type:set': []
  'strategy:create': []
}>()

const modalStore = useSharedModalStore()

const { valueToString: baseAmountToString } = useSharedBigNumberFormatter(
  computed(() => props.baseAmount),
  { decimalPlaces: UI_DEFAULT_MIN_DISPLAY_DECIMALS }
)

const { valueToString: quoteAmountToString } = useSharedBigNumberFormatter(
  computed(() => props.quoteAmount),
  { decimalPlaces: UI_DEFAULT_MIN_DISPLAY_DECIMALS }
)

const { valueToString: marginToString } = useSharedBigNumberFormatter(
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
  <AppModal v-model="modalStore.modals[Modal.SgtBalancedFees]">
    <template #title>
      <h3 class="text-white">{{ $t('sgt.saveOnFees') }}</h3>
    </template>

    <div>
      <p class="text-sm text-coolGray-450">
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
          class="text-blue-550 hover:text-blue-300 font-semibold"
        >
          {{ $t('sgt.learnMoreHere') }}
        </NuxtLink>
      </p>

      <div class="flex items-center justify-between mt-4">
        <p class="text-coolGray-450">{{ $t('sgt.totalAmount') }}</p>
        <p class="text-coolGray-450">
          <span class="text-white">{{ marginToString }}</span> USD
        </p>
      </div>

      <div class="flex justify-between">
        <p class="text-coolGray-450">{{ $t('sgt.optimizedAmounts') }}</p>

        <div class="text-coolGray-450 text-right">
          <p>
            <span class="text-white">{{ quoteAmountToString }} </span>
            {{ market.quoteToken.symbol }}
          </p>
          <p>
            <span class="text-white">{{ baseAmountToString }} </span>
            {{ market.baseToken.symbol }}
          </p>
        </div>
      </div>

      <div class="grid grid-cols-1 gap-2 mt-6">
        <AppButton class="w-full" size="lg" @click="onChangeInvestmentType">
          {{
            $t('sgt.useFeeOptimizedAmounts', {
              quote: market.quoteToken.symbol,
              base: market.baseToken.symbol
            })
          }}
        </AppButton>

        <AppButton
          variant="primary-outline"
          class="w-full"
          size="lg"
          @click="onCreateStrategy"
        >
          {{ $t('sgt.keepOriginalAmounts') }}
        </AppButton>
      </div>
    </div>
  </AppModal>
</template>
