<script lang="ts" setup>
import { ZERO_IN_BASE } from '@shared/utils/constant'
import { sharedToBalanceInTokenInBase } from '@shared/utils/formatter'
import { Status, StatusType, BigNumberInBase } from '@injectivelabs/utils'
import {
  spotGridMarkets,
  gridStrategyAuthorizationMessageTypes
} from '@/app/data/grid-strategy'
import {
  LEGACY_MARKET_IDS,
  GST_GRID_THRESHOLD,
  GST_MIN_TRADING_SIZE,
  GST_DEFAULT_AUTO_GRIDS,
  UI_DEFAULT_MIN_DISPLAY_DECIMALS,
  CURRENT_MARKET_TO_LEGACY_MARKET_ID_MAP,
  LEGACY_MARKET_TO_CURRENT_MARKET_ID_MAP
} from '@/app/utils/constants'
import { addressAndMarketSlugToSubaccountId } from '@/app/utils/helpers'
import {
  Modal,
  MainPage,
  UiSpotMarket,
  InvestmentTypeGst,
  SpotGridTradingForm,
  SpotGridTradingField
} from '@/types'

const props = defineProps({
  isAuto: Boolean,

  market: {
    type: Object as PropType<UiSpotMarket>,
    required: true
  }
})

const emit = defineEmits<{
  'strategy:create': []
}>()

const router = useRouter()
const spotStore = useSpotStore()
const authZStore = useAuthZStore()
const formErrors = useFormErrors()
const modalStore = useModalStore()
const validate = useValidateForm()
const walletStore = useWalletStore()
const setFormValues = useSetFormValues()
const gridStrategyStore = useGridStrategyStore()
const formValues = useFormValues<SpotGridTradingForm>()
const { $onError } = useNuxtApp()

const status = reactive(new Status(StatusType.Idle))

const { lastTradedPrice: currentPrice } = useSpotLastPrice(
  computed(() => gridStrategyStore.spotMarket!)
)
const { userBalancesWithToken } = useBalance()

const hasActiveStrategy = computed(() =>
  gridStrategyStore.activeStrategies.find((strategy) => {
    const subaccountId = addressAndMarketSlugToSubaccountId(
      walletStore.address,
      props.market.slug
    )

    const contractAddress = spotGridMarkets.find(
      (m) => m.slug === props.market.slug
    )?.contractAddress

    return (
      strategy.subaccountId === subaccountId &&
      strategy.contractAddress === contractAddress
    )
  })
)

const quoteDenomBalance = computed(() =>
  userBalancesWithToken.value.find(
    (balance) => balance.denom === props.market.quoteDenom
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
    (balance) => balance.denom === props.market.baseDenom
  )
)

const baseDenomAmount = computed(() =>
  sharedToBalanceInTokenInBase({
    value: baseDenomBalance.value?.bankBalance || 0,
    decimalPlaces: baseDenomBalance.value?.token.decimals
  })
)

const gridThreshold = computed(() => {
  if (props.isAuto) {
    return GST_DEFAULT_AUTO_GRIDS * GST_MIN_TRADING_SIZE
  }

  const isGridHigherThanGridThreshold =
    !!formValues.value[SpotGridTradingField.Grids] &&
    Number(formValues.value[SpotGridTradingField.Grids]) >= GST_GRID_THRESHOLD

  return new BigNumberInBase(
    isGridHigherThanGridThreshold
      ? Number(formValues.value[SpotGridTradingField.Grids])
      : GST_GRID_THRESHOLD
  ).times(GST_MIN_TRADING_SIZE)
})

const initialInvestment = computed(() =>
  new BigNumberInBase(
    formValues.value[SpotGridTradingField.QuoteInvestmentAmount] || 0
  ).plus(
    new BigNumberInBase(
      formValues.value[SpotGridTradingField.BaseInvestmentAmount] || 0
    ).times(currentPrice.value)
  )
)

const calculatedAmount = computed(() => {
  if (
    !formValues.value[SpotGridTradingField.LowerPrice] ||
    !formValues.value[SpotGridTradingField.UpperPrice] ||
    !currentPrice.value ||
    Number(formValues.value[SpotGridTradingField.UpperPrice]) <=
      Number(formValues.value[SpotGridTradingField.LowerPrice])
  ) {
    return { baseAmount: ZERO_IN_BASE, quoteAmount: ZERO_IN_BASE }
  }

  const lowerBoundary = new BigNumberInBase(
    formValues.value[SpotGridTradingField.LowerPrice]
  )

  const upperBoundary = new BigNumberInBase(
    formValues.value[SpotGridTradingField.UpperPrice]
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

const isLowerBoundGtLastPrice = computed(() =>
  currentPrice.value.lt(formValues.value[SpotGridTradingField.LowerPrice] || 0)
)

const isUpperBoundLtLastPrice = computed(() =>
  currentPrice.value.gt(
    formValues.value[SpotGridTradingField.UpperPrice] || Infinity
  )
)

const hasActiveLegacyStrategy = computed(() =>
  gridStrategyStore.activeStrategies.find(
    (strategy) =>
      strategy.marketId ===
      CURRENT_MARKET_TO_LEGACY_MARKET_ID_MAP[props.market.marketId]
  )
)

const isLegacyMarket = computed(
  () =>
    !!LEGACY_MARKET_IDS.find((marketId) => marketId === props.market.marketId)
)

const newMarketSlug = computed(
  () =>
    spotStore.markets.find(
      (market) =>
        market.marketId ===
        LEGACY_MARKET_TO_CURRENT_MARKET_ID_MAP[props.market.marketId]
    )?.slug || ''
)

const isDisabled = computed(() => {
  const investmentType = formValues.value[SpotGridTradingField.InvestmentType]

  if (walletStore.isAuthzWalletConnected || walletStore.isAutoSignEnabled) {
    return true
  }

  if (Object.keys(formErrors.value).length > 0) {
    return true
  }

  if (!props.isAuto && !formValues.value[SpotGridTradingField.Grids]) {
    return true
  }

  if (investmentType === InvestmentTypeGst.Base) {
    return !formValues.value[SpotGridTradingField.BaseInvestmentAmount]
  }

  if (investmentType === InvestmentTypeGst.Quote) {
    return !formValues.value[SpotGridTradingField.QuoteInvestmentAmount]
  }

  return (
    !formValues.value[SpotGridTradingField.BaseInvestmentAmount] &&
    !formValues.value[SpotGridTradingField.QuoteInvestmentAmount]
  )
})

async function onCheckBalanceFees() {
  emit('strategy:create')

  const { valid } = await validate()

  if (!valid) {
    return
  }

  if (
    !props.isAuto &&
    (isLowerBoundGtLastPrice.value || isUpperBoundLtLastPrice.value)
  ) {
    onCreateStrategy()

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
    onCreateStrategy()
  }
}

function onCreateStrategy() {
  const gridMarket = spotGridMarkets.find(
    (m) => m.slug === gridStrategyStore.spotMarket?.slug
  )

  const isAuthorized = gridStrategyAuthorizationMessageTypes.every((m) =>
    authZStore.granterGrants.some(
      (grant) =>
        grant.authorizationType.endsWith(m) &&
        grant.grantee === gridMarket?.contractAddress
    )
  )

  if (isAuthorized) {
    modalStore.openModal(Modal.CreateSpotGridStrategy)
  } else {
    modalStore.openModal(Modal.CheckSpotGridAuth)
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

  onCreateStrategy()
}

function removeLegacyStrategy() {
  if (!hasActiveLegacyStrategy.value) {
    return
  }

  status.setLoading()

  gridStrategyStore
    .removeStrategyForSubaccount(
      hasActiveLegacyStrategy.value.contractAddress,
      hasActiveLegacyStrategy.value.subaccountId
    )
    .catch($onError)
    .finally(() => {
      status.setIdle()
    })
}

function goToNewMarket() {
  const newMarket = spotStore.markets.find(
    (market) =>
      market.marketId ===
      LEGACY_MARKET_TO_CURRENT_MARKET_ID_MAP[props.market.marketId]
  )

  if (!newMarket) {
    return
  }

  router.push({
    name: MainPage.TradingBotsLiquidityBotsSpot,
    query: { market: newMarketSlug.value }
  })

  gridStrategyStore.$patch({
    spotMarket: newMarket
  })
}
</script>

<template>
  <div>
    <AppButton
      v-if="!hasActiveLegacyStrategy && !isLegacyMarket"
      class="w-full shadow-none select-none"
      v-bind="{ status, disabled: isDisabled }"
      :class="[
        hasActiveStrategy
          ? 'bg-gray-475 text-white hover:opacity-80 pointer-events-none'
          : 'bg-blue-500 text-blue-900'
      ]"
      @click="onCheckBalanceFees"
    >
      <span v-if="walletStore.isAuthzWalletConnected">
        {{ $t('common.unauthorized') }}
      </span>
      <span v-else-if="walletStore.isAutoSignEnabled">
        {{ $t('common.notAvailableinAutoSignMode') }}
      </span>
      <span v-else>{{ $t('sgt.create') }}</span>
    </AppButton>

    <p v-if="hasActiveLegacyStrategy" class="text-xs text-red-500 mt-4">
      {{ $t('sgt.endLegacyBotText') }}
    </p>

    <AppButton
      v-if="hasActiveLegacyStrategy"
      class="bg-red-500 text-black w-full mt-4"
      v-bind="{
        status,
        disabled:
          walletStore.isAuthzWalletConnected || walletStore.isAutoSignEnabled
      }"
      @click="removeLegacyStrategy"
    >
      <span v-if="walletStore.isAuthzWalletConnected">
        {{ $t('common.unauthorized') }}
      </span>
      <span v-else-if="walletStore.isAutoSignEnabled">
        {{ $t('common.notAvailableinAutoSignMode') }}
      </span>

      <span v-else>{{ $t('sgt.endBot') }}</span>
    </AppButton>

    <AppButton
      v-if="isLegacyMarket"
      class="text-xs bg-blue-500 text-blue-100 mt-4 w-full"
      @click="goToNewMarket"
    >
      {{ $t('sgt.goToNewMarket') }}
    </AppButton>

    <ModalsLiquiditySgtBalancedFees
      v-bind="{
        margin: initialInvestment.toFixed(),
        baseAmount: calculatedAmount.baseAmount,
        quoteAmount: calculatedAmount.quoteAmount,
        market
      }"
      @investment-type:set="onInvestmentTypeSet"
      @strategy:create="onCreateStrategy"
    />
  </div>
</template>
