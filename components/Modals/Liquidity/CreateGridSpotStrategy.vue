<script lang="ts" setup>
import { ZERO_IN_BASE } from '@shared/utils/constant'
import { ExitType, StrategyType } from '@injectivelabs/sdk-ts'
import { Status, StatusType, BigNumberInBase } from '@injectivelabs/utils'
import * as EventTracker from '@/app/providers/mixpanel/EventTracker'
import { UI_DEFAULT_MIN_DISPLAY_DECIMALS } from '@/app/utils/constants'
import {
  Modal,
  UiSpotMarket,
  SpotGridTradingForm,
  SpotGridTradingField
} from '@/types'

const props = withDefaults(defineProps<{ isLiquidity?: boolean }>(), {
  isLiquidity: false
})

const modalStore = useModalStore()
const gridStrategyStore = useGridStrategyStore()
const formValues = useFormValues<SpotGridTradingForm>()
const { t } = useLang()
const { $onError } = useNuxtApp()
const notificationStore = useSharedNotificationStore()

const { lastTradedPrice } = useSpotLastPrice(
  computed(() => gridStrategyStore.spotMarket as UiSpotMarket)
)

const hasAgreedToTerms = ref(false)
const status = reactive(new Status(StatusType.Idle))

const baseToken = computed(() => gridStrategyStore.spotMarket?.baseToken)
const quoteToken = computed(() => gridStrategyStore.spotMarket?.quoteToken)

const baseAmount = computed(() => {
  const baseAmount = formValues.value[SpotGridTradingField.BaseInvestmentAmount]

  return new BigNumberInBase(baseAmount || 0).eq(0) ? undefined : baseAmount
})

const quoteAmount = computed(() => {
  const quoteAmount =
    formValues.value[SpotGridTradingField.QuoteInvestmentAmount]

  return new BigNumberInBase(quoteAmount || 0).eq(0) ? undefined : quoteAmount
})

const settleInToken = computed(() => {
  if (formValues.value[SpotGridTradingField.SettleIn] === false) {
    return
  }

  if (formValues.value[SpotGridTradingField.ExitType] === ExitType.Base) {
    return baseToken.value
  }

  if (formValues.value[SpotGridTradingField.ExitType] === ExitType.Quote) {
    return quoteToken.value
  }
})

const isGeometric = computed(
  () =>
    formValues.value[SpotGridTradingField.StrategyType] ===
    StrategyType.Geometric
)

const { valueToString: profitPerGridToString } = useSharedBigNumberFormatter(
  computed(() => {
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
  }),
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

  let err: Error

  gridStrategyStore
    .createStrategy(formValues.value)
    .then(() =>
      notificationStore.success({
        title: t('sgt.success'),
        description: t('sgt.gridStrategyCreatedSuccessfully')
      })
    )
    .catch((e) => {
      err = e
      $onError(e)
    })
    .finally(() => {
      modalStore.closeModal(Modal.CreateSpotGridStrategy)
      status.setIdle()

      EventTracker.trackCreateStrategy({
        error: err?.message,
        formValues: formValues.value,
        market: gridStrategyStore.spotMarket?.slug || '',
        marketPrice: lastTradedPrice.value.toFixed(
          gridStrategyStore.spotMarket?.priceDecimals ||
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
              {{ formValues[SpotGridTradingField.QuoteInvestmentAmount] }}
              {{ quoteToken?.symbol }}
            </span>
          </template>

          <template #baseAmount>
            <span class="font-semibold">
              {{ formValues[SpotGridTradingField.BaseInvestmentAmount] }}
              {{ baseToken?.symbol }}
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
              {{ quoteToken?.symbol }}
            </span>

            <span v-else class="font-semibold">
              {{ baseAmount }}
              {{ baseToken?.symbol }}
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
              {{ formValues[SpotGridTradingField.QuoteInvestmentAmount] }}
              {{ quoteToken?.symbol }}
            </p>

            <p v-if="baseAmount" class="font-semibold">
              {{ formValues[SpotGridTradingField.BaseInvestmentAmount] }}
              {{ baseToken?.symbol }}
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
          <p class="text-gray-500">{{ $t('sgt.priceRange') }}</p>
          <p class="font-semibold">
            {{ formValues[SpotGridTradingField.LowerPrice] }} -
            {{ formValues[SpotGridTradingField.UpperPrice] }}
            {{ quoteToken?.symbol }}
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

        <div class="flex justify-between items-center">
          <p class="text-gray-500">{{ $t('sgt.gridMode') }}</p>

          <p class="font-semibold">
            <span v-if="isGeometric">{{ $t('sgt.geometric') }}</span>
            <span v-else>{{ $t('sgt.arithmetic') }}</span>
          </p>
        </div>

        <div
          v-if="formValues[SpotGridTradingField.StopLoss]"
          class="flex justify-between items-center"
        >
          <p class="text-gray-500">{{ $t('sgt.stopLoss') }}</p>
          <p class="font-semibold">
            {{ formValues[SpotGridTradingField.StopLoss] }}
            {{ quoteToken?.symbol }}
          </p>
        </div>

        <div
          v-if="formValues[SpotGridTradingField.TakeProfit]"
          class="flex justify-between items-center"
        >
          <p class="text-gray-500">{{ $t('sgt.takeProfit') }}</p>
          <p class="font-semibold">
            {{ formValues[SpotGridTradingField.TakeProfit] }}
            {{ quoteToken?.symbol }}
          </p>
        </div>

        <div v-if="settleInToken" class="flex justify-between items-center">
          <p class="text-gray-500">{{ $t('sgt.advanced.settleIn') }}</p>
          <div class="font-semibold flex items-center space-x-2">
            <CommonTokenIcon v-bind="{ token: settleInToken }" is-sm />
            <p>{{ settleInToken.symbol }}</p>
          </div>
        </div>

        <div
          v-if="formValues[SpotGridTradingField.SellBaseOnStopLoss]"
          class="flex justify-between items-center"
        >
          <p class="text-gray-500">
            {{
              $t('sgt.advanced.sellAllOnStop', { symbol: baseToken?.symbol })
            }}
          </p>
          <p class="font-semibold">{{ $t('sgt.advanced.enabled') }}</p>
        </div>

        <div
          v-if="formValues[SpotGridTradingField.BuyBaseOnTakeProfit]"
          class="flex justify-between items-center"
        >
          <p class="text-gray-500">
            {{ $t('sgt.advanced.buyOnStop', { symbol: baseToken?.symbol }) }}
          </p>
          <p class="font-semibold">{{ $t('sgt.advanced.enabled') }}</p>
        </div>

        <div class="flex py-6">
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
