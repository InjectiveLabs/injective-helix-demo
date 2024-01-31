<script lang="ts" setup>
import {
  Status,
  StatusType,
  BigNumberInWei,
  BigNumberInBase
} from '@injectivelabs/utils'
import { UiSpotMarketWithToken, ZERO_IN_BASE } from '@injectivelabs/sdk-ui-ts'
import {
  Modal,
  InvestmentTypeGst,
  SpotGridTradingForm,
  SpotGridTradingField
} from '@/types'
import {
  spotGridMarkets,
  gridStrategyAuthorizationMessageTypes
} from '@/app/data/grid-strategy'
import {
  GST_DEFAULT_AUTO_GRIDS,
  GST_GRID_THRESHOLD,
  GST_MIN_TRADING_SIZE,
  UI_DEFAULT_MIN_DISPLAY_DECIMALS
} from '@/app/utils/constants'
import { addressAndMarketSlugToSubaccountId } from '@/app/utils/helpers'

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

const authZStore = useAuthZStore()
const modalStore = useModalStore()
const walletStore = useWalletStore()
const gridStrategyStore = useGridStrategyStore()
const formValues = useFormValues<SpotGridTradingForm>()
const setFormValues = useSetFormValues()
const validate = useValidateForm()

const status = reactive(new Status(StatusType.Idle))

const { lastTradedPrice: currentPrice } = useSpotLastPrice(
  computed(() => gridStrategyStore.spotMarket!)
)
const { accountBalancesWithToken } = useBalance()

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
    formValues.value[SpotGridTradingField.InvestmentAmount] || 0
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

const isTiaOrInj = computed(() =>
  ['tia', 'inj'].includes(props.market.baseToken.symbol.toLowerCase())
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
    [SpotGridTradingField.InvestmentAmount]:
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
</script>

<template>
  <div>
    <AppButton
      :status="status"
      is-lg
      class="w-full shadow-none select-none"
      :class="[
        hasActiveStrategy
          ? 'bg-gray-475 text-white hover:opacity-80 pointer-events-none'
          : 'bg-blue-500 text-blue-900'
      ]"
      :is-disabled="isTiaOrInj"
      @click="onCheckBalanceFees"
    >
      <span v-if="isTiaOrInj">{{ $t('underMaintenance') }}</span>
      <span v-else>{{ $t('sgt.create') }}</span>
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
