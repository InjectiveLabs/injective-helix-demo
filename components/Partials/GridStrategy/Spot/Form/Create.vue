<script lang="ts" setup>
import {
  Status,
  StatusType,
  BigNumberInWei,
  BigNumberInBase
} from '@injectivelabs/utils'
import { UiSpotMarketWithToken, ZERO_IN_BASE } from '@injectivelabs/sdk-ui-ts'
import {
  GST_GRID_THRESHOLD,
  GST_MIN_TRADING_SIZE,
  GST_DEFAULT_AUTO_GRIDS,
  UI_DEFAULT_MIN_DISPLAY_DECIMALS,
  GST_MIN_TRADING_SIZE_LOW,
  CURRENT_MARKET_TO_LEGACY_MARKETID_MAP,
  LEGACY_MARKETIDS,
  LEGACY_MARKET_TO_CURRENT_MARKETID_MAP
} from '@/app/utils/constants'
import {
  spotGridMarkets,
  gridStrategyAuthorizationMessageTypes,
  MARKETS_WITH_LOW_TRADING_SIZE
} from '@/app/data/grid-strategy'
import { addressAndMarketSlugToSubaccountId } from '@/app/utils/helpers'
import {
  Modal,
  InvestmentTypeGst,
  SpotGridTradingForm,
  SpotGridTradingField,
  TradingBotsSubPage
} from '@/types'

const props = defineProps({
  isAuto: Boolean,

  market: {
    type: Object as PropType<UiSpotMarketWithToken>,
    required: true
  }
})

const emit = defineEmits<{
  'strategy:create': []
}>()

const spotStore = useSpotStore()
const authZStore = useAuthZStore()
const modalStore = useModalStore()
const walletStore = useWalletStore()
const gridStrategyStore = useGridStrategyStore()
const formValues = useFormValues<SpotGridTradingForm>()
const setFormValues = useSetFormValues()
const validate = useValidateForm()
const { $onError } = useNuxtApp()

const { lastTradedPrice: currentPrice } = useSpotLastPrice(
  computed(() => gridStrategyStore.spotMarket!)
)
const { accountBalancesWithToken } = useBalance()

const status = reactive(new Status(StatusType.Idle))

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
  accountBalancesWithToken.value.find(
    (balance) => balance.denom === props.market.quoteDenom
  )
)

const quoteDenomAmount = computed(() =>
  new BigNumberInWei(quoteDenomBalance.value?.bankBalance || 0).toBase(
    quoteDenomBalance.value?.token.decimals
  )
)

const baseDenomBalance = computed(() =>
  accountBalancesWithToken.value.find(
    (balance) => balance.denom === props.market.baseDenom
  )
)

const baseDenomAmount = computed(() =>
  new BigNumberInWei(baseDenomBalance.value?.bankBalance || 0).toBase(
    baseDenomBalance.value?.token.decimals
  )
)

const gridThreshold = computed(() => {
  const isLowTradingSize = MARKETS_WITH_LOW_TRADING_SIZE.includes(
    props.market.slug
  )

  const tradingSize = isLowTradingSize
    ? GST_MIN_TRADING_SIZE_LOW
    : GST_MIN_TRADING_SIZE

  if (props.isAuto) {
    return GST_DEFAULT_AUTO_GRIDS * tradingSize
  }

  const isGridHigherThanGridThreshold =
    !!formValues.value[SpotGridTradingField.Grids] &&
    Number(formValues.value[SpotGridTradingField.Grids]) >= GST_GRID_THRESHOLD

  return new BigNumberInBase(
    isGridHigherThanGridThreshold
      ? Number(formValues.value[SpotGridTradingField.Grids])
      : GST_GRID_THRESHOLD
  ).times(tradingSize)
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
      (g) =>
        g.authorization.endsWith(m) && g.grantee === gridMarket?.contractAddress
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

const hasActiveLegacyStrategy = computed(() =>
  gridStrategyStore.activeStrategies.find(
    (strategy) =>
      strategy.marketId ===
      CURRENT_MARKET_TO_LEGACY_MARKETID_MAP[props.market.marketId]
  )
)

const isLegacyMarket = computed(
  () =>
    !!LEGACY_MARKETIDS.find((marketId) => marketId === props.market.marketId)
)

const newMarketSlug = computed(
  () =>
    spotStore.markets.find(
      (market) =>
        market.marketId ===
        LEGACY_MARKET_TO_CURRENT_MARKETID_MAP[props.market.marketId]
    )?.slug || ''
)

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
</script>

<template>
  <div>
    <AppButton
      v-if="!hasActiveLegacyStrategy && !isLegacyMarket"
      :is-disabled="hasActiveLegacyStrategy || isLegacyMarket"
      class="w-full shadow-none select-none"
      :class="[
        hasActiveStrategy
          ? 'bg-gray-475 text-white hover:opacity-80 pointer-events-none'
          : 'bg-blue-500 text-blue-100'
      ]"
      :status="status"
      is-lg
      @click="onCheckBalanceFees"
    >
      <span>{{ $t('sgt.create') }}</span>
    </AppButton>

    <p v-if="hasActiveLegacyStrategy" class="text-xs text-red-500 mt-4">
      {{ $t('sgt.endLegacyBotText') }}
    </p>

    <AppButton
      v-if="hasActiveLegacyStrategy"
      class="bg-red-500 text-black w-full mt-4"
      v-bind="{ status }"
      @click="removeLegacyStrategy"
    >
      {{ $t('sgt.endBot') }}
    </AppButton>

    <NuxtLink
      :to="{
        name: TradingBotsSubPage.GridSpotMarket,
        params: { market: newMarketSlug }
      }"
    >
      <AppButton
        v-if="isLegacyMarket"
        class="text-xs bg-blue-500 text-blue-100 mt-4 w-full"
      >
        {{ $t('sgt.goToNewMarket') }}
      </AppButton>
    </NuxtLink>

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
