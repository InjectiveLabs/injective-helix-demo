<script lang="ts" setup>
import { BigNumberInBase } from '@injectivelabs/utils'
import { TradeDirection } from '@injectivelabs/ts-types'
import { calculateLeverage } from '@/app/utils/formatters'
import {
  UI_DEFAULT_LEVERAGE,
  UI_DEFAULT_MIN_DISPLAY_DECIMALS
} from '@/app/utils/constants'
import {
  Modal,
  MarketKey,
  DerivativeTradeTypes,
  DerivativesTradeFormField
} from '@/types'
import type { UiDerivativeMarket, DerivativesTradeForm } from '@/types'

const appStore = useAppStore()
const modalStore = useSharedModalStore()

const market = inject(MarketKey) as Ref<UiDerivativeMarket>
const derivativeFormValues = useFormValues<DerivativesTradeForm>()
const { markPrice } = useDerivativeLastPrice(market)

const props = withDefaults(
  defineProps<{
    worstPrice: BigNumberInBase
  }>(),
  {}
)

const previousLeverage = ref('1')

const maxLeverageAvailable = computed(() =>
  calculateLeverage(market.value.initialMarginRatio).toFixed()
)

const futuresLeveragePreference = computed(() => {
  const leveragePreference =
    appStore.userState.preferences.futuresLeverage || '1'

  const futuresLeverage = new BigNumberInBase(leveragePreference)
    .decimalPlaces(UI_DEFAULT_MIN_DISPLAY_DECIMALS)
    .toNumber()

  return futuresLeverage > Number(maxLeverageAvailable.value)
    ? maxLeverageAvailable.value
    : leveragePreference
})

const maxLeverageAllowed = computed(() => {
  if (
    derivativeFormValues.value[DerivativesTradeFormField.Type] ===
    DerivativeTradeTypes.Market
  ) {
    const priceWithMarginRatio = new BigNumberInBase(markPrice.value).times(
      market.value.initialMarginRatio
    )

    const priceBasedOnOrderSide =
      derivativeFormValues.value[DerivativesTradeFormField.Side] ===
      TradeDirection.Long
        ? priceWithMarginRatio.minus(markPrice.value).plus(props.worstPrice)
        : priceWithMarginRatio.plus(markPrice.value).minus(props.worstPrice)

    return props.worstPrice.dividedBy(priceBasedOnOrderSide)
  }

  return new BigNumberInBase(maxLeverageAvailable.value)
})

const { value: leverage } = useStringField({
  name: DerivativesTradeFormField.Leverage,
  initialValue: futuresLeveragePreference.value || UI_DEFAULT_LEVERAGE
})

const { value: tempLeverage, errorMessage } = useStringField({
  name: DerivativesTradeFormField.TempLeverage,
  initialValue: futuresLeveragePreference.value || UI_DEFAULT_LEVERAGE,
  dynamicRule: computed(() => `maxLeverage:${maxLeverageAllowed.value}`)
})

function onCancel() {
  tempLeverage.value = previousLeverage.value
  modalStore.closeModal(Modal.Leverage)
}

function onConfirm() {
  leverage.value = tempLeverage.value
  appStore.setFuturesLeverage(tempLeverage.value)
  modalStore.closeModal(Modal.Leverage)
}

function setPreviousLeverage() {
  previousLeverage.value = leverage.value
}

onMounted(() => {
  appStore.setFuturesLeverage(leverage.value)
})
</script>

<template>
  <AppModal
    v-model="modalStore.modals[Modal.Leverage]"
    v-bind="{
      ui: { width: 'sm:min-w-sm sm:max-w-sm' }
    }"
    @on:open="setPreviousLeverage"
    @on:close="onCancel"
  >
    <div>
      <h4 class="text-2xl max-sm:text-xl text-coolGray-200">
        {{ $t('trade.leverageModal.title') }}
      </h4>

      <p class="mt-5 mb-4 text-coolGray-375 text-sm">
        {{ $t('trade.leverageModal.description') }}
      </p>

      <PartialsTradeFuturesFormStandardLeverage
        v-model:leverage="tempLeverage"
        v-bind="{
          worstPrice,
          errorMessage,
          maxLeverageAllowed,
          futuresLeveragePreference
        }"
      />

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
