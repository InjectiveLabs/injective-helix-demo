<script lang="ts" setup>
import { dataCyTag } from '@shared/utils'
import { BigNumberInBase } from '@injectivelabs/utils'
import {
  MAX_SLIPPAGE,
  DEFAULT_SLIPPAGE,
  HIGH_SLIPPAGE_THRESHOLD
} from '@/app/utils/constants'
import { Modal, MarketKey, SpotMarketCyTags, SpotTradeFormField } from '@/types'
import type { UiSpotMarket } from '@/types'

const appStore = useAppStore()
const modalStore = useSharedModalStore()

const spotMarket = inject(MarketKey) as Ref<UiSpotMarket>

const defaultSlippage = DEFAULT_SLIPPAGE.toFixed()
const previousSlippage = ref(defaultSlippage)

const isHighSlippage = computed(() =>
  new BigNumberInBase(tempSlippage.value).gt(HIGH_SLIPPAGE_THRESHOLD)
)

const currentSlippageValue = computed(
  () =>
    appStore.userState.marketSlippageIdMap[spotMarket.value.marketId] ||
    defaultSlippage
)

const { value: slippage } = useStringField({
  name: SpotTradeFormField.Slippage,
  initialValue: currentSlippageValue.value
})

const { value: tempSlippage, errorMessage } = useStringField({
  rule: 'slippage',
  name: SpotTradeFormField.TempSlippage,
  initialValue: currentSlippageValue.value
})

function onCancel() {
  tempSlippage.value = previousSlippage.value
  modalStore.closeModal(Modal.SpotSlippage)
}

function onConfirm() {
  const slippageInBigNumber = new BigNumberInBase(tempSlippage.value)

  const finalSlippage =
    slippageInBigNumber.gt(MAX_SLIPPAGE) ||
    slippageInBigNumber.lt(DEFAULT_SLIPPAGE)
      ? DEFAULT_SLIPPAGE.toFixed()
      : tempSlippage.value

  slippage.value = finalSlippage

  appStore.setUserState({
    ...appStore.userState,
    marketSlippageIdMap: {
      ...appStore.userState.marketSlippageIdMap,
      [spotMarket.value.marketId]: finalSlippage
    }
  })

  modalStore.closeModal(Modal.SpotSlippage)
}

function setPreviousSlippage() {
  previousSlippage.value = slippage.value
  tempSlippage.value = slippage.value
}
</script>

<template>
  <AppModal
    v-model="modalStore.modals[Modal.SpotSlippage]"
    v-bind="{
      ui: { width: 'sm:min-w-sm sm:max-w-sm' }
    }"
    @on:close="onCancel"
    @on:open="setPreviousSlippage"
  >
    <div>
      <h4 class="text-2xl max-sm:text-xl text-coolGray-200">
        {{ $t('trade.slippageModal.title') }}
      </h4>

      <p class="mt-5 mb-4 text-coolGray-375 text-sm">
        {{ $t('trade.slippageModal.description') }}
      </p>

      <div class="mt-6 mb-4">
        <AppInputField
          v-model="tempSlippage"
          v-bind="{
            min: 0,
            decimals: 2,
            noStyle: true,
            alignLeft: true,
            max: MAX_SLIPPAGE.toNumber(),
            wrapperClass:
              'block focus-within:focus-ring transition-all duration-300 border border-[#181E31] rounded-md bg-brand-875 text-sm pl-2 pr-4'
          }"
          :data-cy="dataCyTag(SpotMarketCyTags.SlippageInputField)"
        >
          <template #right>%</template>
        </AppInputField>
      </div>

      <p v-if="errorMessage" class="text-red-500 text-xs mb-3">
        {{ errorMessage }}
      </p>

      <p v-else-if="isHighSlippage" class="text-orange-500 text-xs mb-3">
        {{ $t('trade.slippageWarning') }}
      </p>

      <div class="flex items-center justify-end gap-2 mt-6">
        <AppButton
          variant="primary-cta"
          class="text-azure-blue-350"
          @click="onCancel"
        >
          {{ $t('common.cancel') }}
        </AppButton>

        <AppButton
          variant="primary"
          class="bg-azure-blue-350 hover:bg-azure-blue-350/80"
          @click="onConfirm"
        >
          {{ $t('common.confirm') }}
        </AppButton>
      </div>
    </div>
  </AppModal>
</template>
