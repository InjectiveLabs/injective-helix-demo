<script setup lang="ts">
import { ZERO_IN_BASE } from '@shared/utils/constant'
import { sharedToBalanceInTokenInBase } from '@shared/utils/formatter'
import { Status, StatusType, BigNumberInBase } from '@injectivelabs/utils'
import * as EventTracker from '@/app/providers/mixpanel/EventTracker'
import {
  Modal,
  MarketKey,
  UiSpotMarket,
  InvestmentTypeGst,
  SpotGridTradingForm,
  SpotGridTradingField
} from '@/types'
import {
  GST_GRID_THRESHOLD,
  GST_MIN_TRADING_SIZE,
  GST_DEFAULT_AUTO_GRIDS,
  UI_DEFAULT_MIN_DISPLAY_DECIMALS
} from '@/app/utils/constants'

const market = inject(MarketKey) as Ref<UiSpotMarket>

const spotStore = useSpotStore()
const validate = useValidateForm()
const formErrors = useFormErrors()
const modalStore = useSharedModalStore()
const setFormValues = useSetFormValues()
const sharedWalletStore = useSharedWalletStore()
const gridStrategyStore = useGridStrategyStore()
const notificationStore = useSharedNotificationStore()
const spotFormValues = useFormValues<SpotGridTradingForm>()
const { t } = useLang()
const { $onError } = useNuxtApp()
const { userBalancesWithToken } = useBalance()

const props = withDefaults(
  defineProps<{
    isAuto?: boolean
  }>(),
  {
    isAuto: false
  }
)

const status = reactive(new Status(StatusType.Idle))

const quoteDenomBalance = computed(() =>
  userBalancesWithToken.value.find(
    (balance) => balance.denom === market.value.quoteDenom
  )
)

const quoteDenomAmount = computed(() =>
  sharedToBalanceInTokenInBase({
    value: quoteDenomBalance.value?.bankBalance || 0,
    decimalPlaces: quoteDenomBalance.value?.token.decimals
  })
)

const baseDenomBalance = computed(() =>
  userBalancesWithToken.value.find(
    (balance) => balance.denom === market.value.baseDenom
  )
)

const baseDenomAmount = computed(() =>
  sharedToBalanceInTokenInBase({
    value: baseDenomBalance.value?.bankBalance || 0,
    decimalPlaces: baseDenomBalance.value?.token.decimals
  })
)

const isDisabled = computed(() => {
  if (
    sharedWalletStore.isAutoSignEnabled ||
    sharedWalletStore.isAuthzWalletConnected
  ) {
    return true
  }

  if (Object.keys(formErrors.value).length > 0) {
    return true
  }

  return (
    !spotFormValues.value[SpotGridTradingField.BaseInvestmentAmount] &&
    !spotFormValues.value[SpotGridTradingField.QuoteInvestmentAmount]
  )
})

const { lastTradedPrice: currentPrice } = useSpotLastPrice(
  computed(() => market.value)
)

const isLowerBoundGtLastPrice = computed(() =>
  currentPrice.value.lt(
    spotFormValues.value[SpotGridTradingField.LowerPrice] || 0
  )
)

const isUpperBoundLtLastPrice = computed(() =>
  currentPrice.value.gt(
    spotFormValues.value[SpotGridTradingField.UpperPrice] || Infinity
  )
)

const gridThreshold = computed(() => {
  if (props.isAuto) {
    return GST_DEFAULT_AUTO_GRIDS * GST_MIN_TRADING_SIZE
  }

  const isGridHigherThanGridThreshold =
    !!spotFormValues.value[SpotGridTradingField.Grids] &&
    Number(spotFormValues.value[SpotGridTradingField.Grids]) >=
      GST_GRID_THRESHOLD

  return new BigNumberInBase(
    isGridHigherThanGridThreshold
      ? Number(spotFormValues.value[SpotGridTradingField.Grids])
      : GST_GRID_THRESHOLD
  ).times(GST_MIN_TRADING_SIZE)
})

const calculatedAmount = computed(() => {
  if (
    !spotFormValues.value[SpotGridTradingField.LowerPrice] ||
    !spotFormValues.value[SpotGridTradingField.UpperPrice] ||
    !currentPrice.value ||
    Number(spotFormValues.value[SpotGridTradingField.UpperPrice]) <=
      Number(spotFormValues.value[SpotGridTradingField.LowerPrice])
  ) {
    return { baseAmount: ZERO_IN_BASE, quoteAmount: ZERO_IN_BASE }
  }

  const lowerBoundary = new BigNumberInBase(
    spotFormValues.value[SpotGridTradingField.LowerPrice]
  )

  const upperBoundary = new BigNumberInBase(
    spotFormValues.value[SpotGridTradingField.UpperPrice]
  )

  const ratio = currentPrice.value
    .minus(lowerBoundary)
    .dividedBy(upperBoundary.minus(lowerBoundary))

  const baseAmount = initialInvestment.value
    .times(new BigNumberInBase(1).minus(ratio))
    .dividedBy(currentPrice.value)

  const quoteAmount = initialInvestment.value.times(ratio)

  return { baseAmount, quoteAmount }
})

const initialInvestment = computed(() =>
  new BigNumberInBase(
    spotFormValues.value[SpotGridTradingField.QuoteInvestmentAmount] || 0
  ).plus(
    new BigNumberInBase(
      spotFormValues.value[SpotGridTradingField.BaseInvestmentAmount] || 0
    ).times(currentPrice.value)
  )
)

async function onCheckBalanceFees() {
  const { valid } = await validate()

  if (!valid) {
    return
  }

  if (
    !props.isAuto &&
    (isLowerBoundGtLastPrice.value || isUpperBoundLtLastPrice.value)
  ) {
    createStrategy()

    return
  }

  const minAmount = new BigNumberInBase(gridThreshold.value)

  const baseInUsdt = new BigNumberInBase(
    calculatedAmount.value.baseAmount
  ).times(currentPrice.value)

  const isBaseLtBalance = baseDenomAmount.value.gt(
    calculatedAmount.value.baseAmount
  )

  const isQuoteLtBalance = quoteDenomAmount.value.gt(
    calculatedAmount.value.quoteAmount
  )

  const isCalculatedLessThanMinimum = minAmount
    .minus(0.1)
    .gt(baseInUsdt.plus(calculatedAmount.value.quoteAmount))

  if (isBaseLtBalance && isQuoteLtBalance && !isCalculatedLessThanMinimum) {
    modalStore.openModal(Modal.SgtBalancedFees)
  } else {
    createStrategy()
  }
}

function onInvestmentTypeSet() {
  setFormValues({
    [SpotGridTradingField.QuoteInvestmentAmount]:
      calculatedAmount.value.quoteAmount.toFixed(
        UI_DEFAULT_MIN_DISPLAY_DECIMALS
      ),
    [SpotGridTradingField.BaseInvestmentAmount]:
      calculatedAmount.value.baseAmount.toFixed(
        UI_DEFAULT_MIN_DISPLAY_DECIMALS
      ),
    [SpotGridTradingField.InvestmentType]: InvestmentTypeGst.BaseAndQuote
  })

  createStrategy()
}

async function createStrategy() {
  const { valid } = await validate()

  if (!valid || !market.value) {
    return
  }

  status.setLoading()

  let err: Error

  gridStrategyStore
    .createStrategy(spotFormValues.value, market.value)
    .then(() => {
      notificationStore.success({ title: t('common.success') })
    })
    .catch((e) => {
      err = e
      $onError(e)
    })
    .finally(async () => {
      const lastTrade = await spotStore.fetchLastTrade({
        marketId: market.value.marketId
      })

      const lastTradedPrice = sharedToBalanceInTokenInBase({
        value: lastTrade.price,
        decimalPlaces:
          market.value.quoteToken.decimals - market.value.baseToken.decimals
      })

      EventTracker.trackCreateStrategy({
        error: err?.message,
        formValues: spotFormValues.value,
        market: market.value.slug || '',
        marketPrice: lastTradedPrice.toFixed(market.value.priceDecimals),
        isLiquidity: false
      })

      status.setIdle()
    })
}
</script>

<template>
  <div class="py-4">
    <AppButton
      class="w-full text-gray-450 text-base font-medium border border-blue-550 py-2.5"
      :class="[isDisabled ? 'text-coolGray-450' : 'text-coolGray-975']"
      v-bind="{ status, disabled: isDisabled }"
      @click="onCheckBalanceFees"
    >
      <span v-if="sharedWalletStore.isAuthzWalletConnected">
        {{ $t('common.unauthorized') }}
      </span>
      <span v-else>{{ $t('sgt.create') }}</span>
    </AppButton>

    <span
      v-if="sharedWalletStore.isAutoSignEnabled"
      class="text-xs text-red-500"
    >
      {{ $t('common.notAvailableinAutoSignMode') }}
    </span>

    <ModalsLiquiditySgtBalancedFees
      v-bind="{
        margin: initialInvestment.toFixed(),
        baseAmount: calculatedAmount.baseAmount,
        quoteAmount: calculatedAmount.quoteAmount,
        market
      }"
      @investment-type:set="onInvestmentTypeSet"
      @strategy:create="createStrategy"
    />
  </div>
</template>
