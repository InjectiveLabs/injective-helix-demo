<script lang="ts" setup>
import { Status, StatusType, BigNumberInBase } from '@injectivelabs/utils'
import { UiSpotMarketWithToken, ZERO_IN_BASE } from '@injectivelabs/sdk-ui-ts'
import { ExitConfig, ExitType } from '@injectivelabs/sdk-ts'
import { Modal, SpotGridTradingForm, SpotGridTradingField } from '@/types'
import { UI_DEFAULT_MIN_DISPLAY_DECIMALS } from '@/app/utils/constants'
import { mixpanelAnalytics } from '@/app/providers/mixpanel'
const props = defineProps({
  isLiquidity: Boolean
})

const modalStore = useModalStore()
const gridStrategyStore = useGridStrategyStore()
const formValues = useFormValues<SpotGridTradingForm>()
const { lastTradedPrice } = useSpotLastPrice(
  computed(() => gridStrategyStore.spotMarket as UiSpotMarketWithToken)
)

const { success } = useNotifications()
const { $onError } = useNuxtApp()
const { t } = useLang()

const status = reactive(new Status(StatusType.Idle))
const hasAgreedToTerms = ref(false)

const profitPerGrid = computed(() => {
  if (
    !formValues.value[SpotGridTradingField.LowerPrice] ||
    !formValues.value[SpotGridTradingField.UpperPrice] ||
    !formValues.value[SpotGridTradingField.Grids] ||
    !gridStrategyStore.spotMarket ||
    Number(formValues.value[SpotGridTradingField.Grids]) === 0
  ) {
    return ZERO_IN_BASE
  }

  const priceDifference = new BigNumberInBase(
    formValues.value[SpotGridTradingField.UpperPrice]
  )
    .minus(formValues.value[SpotGridTradingField.LowerPrice])
    .dividedBy(formValues.value[SpotGridTradingField.Grids])

  return priceDifference
    .dividedBy(formValues.value[SpotGridTradingField.LowerPrice])
    .times(100)
})

const quoteSymbol = computed(
  () => gridStrategyStore.spotMarket?.quoteToken.symbol
)
const baseSymbol = computed(
  () => gridStrategyStore.spotMarket?.baseToken.symbol
)

const baseAmount = computed(() => {
  const baseAmount = formValues.value[SpotGridTradingField.BaseInvestmentAmount]

  if (!baseAmount || new BigNumberInBase(baseAmount).eq(0)) {
    return undefined
  }

  return baseAmount
})

const quoteAmount = computed(() => {
  const quoteAmount = formValues.value[SpotGridTradingField.InvestmentAmount]

  if (!quoteAmount || new BigNumberInBase(quoteAmount).eq(0)) {
    return undefined
  }

  return quoteAmount
})

const { valueToString: profitPerGridToString } = useBigNumberFormatter(
  profitPerGrid,
  { decimalPlaces: UI_DEFAULT_MIN_DISPLAY_DECIMALS }
)

function onCloseModal() {
  modalStore.closeModal(Modal.CreateSpotGridStrategy)
}

function onCreateStrategy() {
  if (
    !formValues.value[SpotGridTradingField.LowerPrice] ||
    !formValues.value[SpotGridTradingField.Grids] ||
    !formValues.value[SpotGridTradingField.UpperPrice]
  ) {
    return
  }

  status.setLoading()

  const stopLoss: ExitConfig | undefined = formValues.value[
    SpotGridTradingField.StopLoss
  ]
    ? {
        exitType: formValues.value[SpotGridTradingField.SellBaseOnStopLoss]
          ? ExitType.Quote
          : ExitType.Default,
        exitPrice: formValues.value[SpotGridTradingField.StopLoss]
      }
    : undefined

  const takeProfit: ExitConfig | undefined = formValues.value[
    SpotGridTradingField.TakeProfit
  ]
    ? {
        exitType: formValues.value[SpotGridTradingField.BuyBaseOnTakeProfit]
          ? ExitType.Base
          : ExitType.Default,
        exitPrice: formValues.value[SpotGridTradingField.TakeProfit]
      }
    : undefined

  const exitType: ExitType | undefined = formValues.value[
    SpotGridTradingField.SellBaseUponTermination
  ]
    ? ExitType.Base
    : ExitType.Default

  gridStrategyStore
    .createStrategy({
      levels: Number(formValues.value[SpotGridTradingField.Grids]),
      lowerBound: formValues.value[SpotGridTradingField.LowerPrice],
      upperBound: formValues.value[SpotGridTradingField.UpperPrice],
      baseAmount: baseAmount.value,
      quoteAmount: quoteAmount.value,
      stopLoss,
      takeProfit,
      exitType
    })
    .then(() => {
      success({
        title: t('sgt.success'),
        description: t('sgt.gridStrategyCreatedSuccessfully')
      })
    })
    .catch($onError)
    .finally(() => {
      modalStore.closeModal(Modal.CreateSpotGridStrategy)
      status.setIdle()

      mixpanelAnalytics.trackCreateStrategy({
        amountQuote:
          formValues.value[SpotGridTradingField.InvestmentAmount] || '',
        gridsNumber: formValues.value[SpotGridTradingField.Grids] || '',
        lowerPrice: formValues.value[SpotGridTradingField.LowerPrice] || '',
        upperPrice: formValues.value[SpotGridTradingField.UpperPrice] || '',
        amountDenom:
          formValues.value[SpotGridTradingField.BaseInvestmentAmount],
        market: gridStrategyStore.spotMarket?.slug || '',
        marketPrice: lastTradedPrice.value.toFixed(
          UI_DEFAULT_MIN_DISPLAY_DECIMALS
        ),
        isLiquidity: props.isLiquidity
      })
    })
}
</script>
<template>
  <AppModal
    :is-open="modalStore.modals[Modal.CreateSpotGridStrategy]"
    @modal:closed="onCloseModal"
  >
    <template #title>
      <p class="[text-transform:none] text-lg font-bold py-2">
        {{ $t('sgt.gridOrderConfirmation') }}
      </p>
    </template>

    <div class="max-w-sm">
      <p>
        <i18n-t
          v-if="baseAmount && quoteAmount"
          tag="p"
          keypath="sgt.createStrategyModalBaseAndQuote"
        >
          <template #quoteAmount>
            <span class="font-semibold">
              {{ formValues[SpotGridTradingField.InvestmentAmount] }}
              {{ quoteSymbol }}
            </span>
          </template>

          <template #baseAmount>
            <span class="font-semibold">
              {{ formValues[SpotGridTradingField.BaseInvestmentAmount] }}
              {{ baseSymbol }}
            </span>
          </template>

          <template #marketSlug>
            <span class="uppercase">
              {{ gridStrategyStore.spotMarket?.slug }}
            </span>
          </template>
        </i18n-t>

        <i18n-t v-else tag="p" keypath="sgt.createStrategyModalQuote">
          <template #quoteAmount>
            <span v-if="quoteAmount" class="font-semibold">
              {{ quoteAmount }}
              {{ quoteSymbol }}
            </span>

            <span v-else class="font-semibold">
              {{ baseAmount }}
              {{ baseSymbol }}
            </span>
          </template>

          <template #marketSlug>
            <span class="uppercase">
              {{ gridStrategyStore.spotMarket?.slug }}
            </span>
          </template>
        </i18n-t>
      </p>

      <div class="mt-6 space-y-1">
        <div class="flex justify-between">
          <p class="text-gray-500">{{ $t('sgt.tradeAmount') }}</p>

          <div class="flex flex-col items-end">
            <p v-if="quoteAmount" class="font-semibold">
              {{ formValues[SpotGridTradingField.InvestmentAmount] }}
              {{ quoteSymbol }}
            </p>

            <p v-if="baseAmount" class="font-semibold">
              {{ formValues[SpotGridTradingField.BaseInvestmentAmount] }}
              {{ baseSymbol }}
            </p>
          </div>
        </div>

        <div class="flex justify-between items-center">
          <p class="text-gray-500">{{ $t('sgt.market') }}</p>
          <p class="font-semibold">
            {{ gridStrategyStore.spotMarket?.ticker }}
          </p>
        </div>

        <div class="flex justify-between items-center">
          <p class="text-gray-500">{{ $t('sgt.gridMode') }}</p>
          <p class="font-semibold">{{ $t('sgt.arithmetic') }}</p>
        </div>

        <div class="flex justify-between items-center">
          <p class="text-gray-500">{{ $t('sgt.priceRange') }}</p>
          <p class="font-semibold">
            {{ formValues[SpotGridTradingField.LowerPrice] }} -
            {{ formValues[SpotGridTradingField.UpperPrice] }}
            {{ quoteSymbol }}
          </p>
        </div>

        <div class="flex justify-between items-center">
          <p class="text-gray-500">{{ $t('sgt.gridNumber') }}</p>
          <p class="font-semibold">
            {{ formValues[SpotGridTradingField.Grids] }}
          </p>
        </div>

        <div class="flex justify-between items-center">
          <p class="text-gray-500">{{ $t('sgt.profitGrid') }}</p>
          <p class="font-semibold">{{ profitPerGridToString }} %</p>
        </div>

        <div
          v-if="formValues[SpotGridTradingField.StopLoss]"
          class="flex justify-between items-center"
        >
          <p class="text-gray-500">{{ $t('sgt.stopLoss') }}</p>
          <p class="font-semibold">
            {{ formValues[SpotGridTradingField.StopLoss] }} {{ quoteSymbol }}
          </p>
        </div>

        <div
          v-if="formValues[SpotGridTradingField.TakeProfit]"
          class="flex justify-between items-center"
        >
          <p class="text-gray-500">{{ $t('sgt.takeProfit') }}</p>
          <p class="font-semibold">
            {{ formValues[SpotGridTradingField.TakeProfit] }} {{ quoteSymbol }}
          </p>
        </div>

        <div class="flex my-6">
          <div class="mt-1 mx-2">
            <AppCheckbox v-model="hasAgreedToTerms" />
          </div>
          <div>
            <p class="text-xs opacity-75 leading-none">
              {{ $t('sgt.termsAndConditions') }}
            </p>
          </div>
        </div>

        <div>
          <AppButton
            v-bind="{ status }"
            :is-disabled="!hasAgreedToTerms"
            class="bg-blue-500 disabled:bg-gray-500 w-full"
            @click="onCreateStrategy"
          >
            {{ $t('sgt.confirm') }}
          </AppButton>
        </div>
      </div>
    </div>
  </AppModal>
</template>
