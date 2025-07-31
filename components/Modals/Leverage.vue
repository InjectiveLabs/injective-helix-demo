<script lang="ts" setup>
import { BigNumberInBase } from '@injectivelabs/utils'
import { TradeDirection } from '@injectivelabs/ts-types'
import { calculateLeverage } from '@/app/utils/formatters'
import { UI_DEFAULT_LEVERAGE } from '@/app/utils/constants'
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

const emit = defineEmits<{
  'leverage:update': [value: string]
}>()

const previousLeverage = ref('0')

const maxLeverageAvailable = computed(() =>
  calculateLeverage(market.value.initialMarginRatio).toFixed()
)

const futuresLeveragePreference = computed(() => {
  const leveragePreference =
    appStore.userState.preferences.futuresLeverage || '1'

  const futuresLeverage = Math.round(parseFloat(leveragePreference) * 100) / 100

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

const { value: leverage, errorMessage } = useStringField({
  name: DerivativesTradeFormField.Leverage,
  initialValue: futuresLeveragePreference.value || UI_DEFAULT_LEVERAGE,
  dynamicRule: computed(() => `maxLeverage:${maxLeverageAllowed.value}`)
})

function onCancel() {
  leverage.value = previousLeverage.value
  modalStore.closeModal(Modal.Leverage)
}

function onConfirm() {
  emit('leverage:update', leverage.value)
  modalStore.closeModal(Modal.Leverage)
  appStore.setFuturesLeverage(leverage.value)
}

function setPreviousLeverage() {
  previousLeverage.value = leverage.value
}

onMounted(() => {
  emit('leverage:update', leverage.value)
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
  >
    <div>
      <h4 class="text-2xl max-sm:text-xl text-coolGray-200">
        {{ $t('trade.leverageModal.title') }}
      </h4>

      <p class="mt-5 mb-4 text-coolGray-375 text-sm">
        {{ $t('trade.leverageModal.description') }}
      </p>

      <PartialsTradeFuturesFormStandardLeverage
        v-model:leverage="leverage"
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
