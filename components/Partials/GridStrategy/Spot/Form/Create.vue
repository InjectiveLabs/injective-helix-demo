<script setup lang="ts">
import {
  Status,
  StatusType,
  BigNumberInWei,
  BigNumberInBase
} from '@injectivelabs/utils'
import { UiSpotMarketWithToken, ZERO_IN_BASE } from '@injectivelabs/sdk-ui-ts'
import {
  InvestmentTypeGst,
  Modal,
  SpotGridTradingField,
  SpotGridTradingForm
} from '@/types'
import {
  gridStrategyAuthorizationMessageTypes,
  spotGridMarkets
} from '@/app/data/grid-strategy'
import {
  GST_MIN_TRADING_SIZE,
  UI_DEFAULT_MIN_DISPLAY_DECIMALS
} from '@/app/utils/constants'

const props = defineProps({
  market: {
    type: Object as PropType<UiSpotMarketWithToken>,
    required: true
  }
})

const emit = defineEmits<{
  'investment-type:set': [
    investmentAmount: string,
    baseInvestmentAmount: string
  ]
}>()

const authZStore = useAuthZStore()
const modalStore = useModalStore()
const gridStrategyStore = useGridStrategyStore()
const formValues = useFormValues<SpotGridTradingForm>()
const validate = useValidateForm()

const status = reactive(new Status(StatusType.Idle))

const { lastTradedPrice: currentPrice } = useSpotLastPrice(
  computed(() => gridStrategyStore.spotMarket!)
)
const { accountBalancesWithToken } = useBalance()

const hasActiveStrategy = computed(
  () => gridStrategyStore.activeStrategies.length > 0
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

const calculatedAmount = computed(() => {
  if (
    !formValues.value.investmentAmount ||
    !formValues.value.lowerPrice ||
    !formValues.value.upperPrice ||
    !currentPrice.value ||
    Number(formValues.value.upperPrice) <= Number(formValues.value.lowerPrice)
  ) {
    return { baseAmount: ZERO_IN_BASE, quoteAmount: ZERO_IN_BASE }
  }

  const lowerBoundary = new BigNumberInBase(formValues.value.lowerPrice)
  const upperBoundary = new BigNumberInBase(formValues.value.upperPrice)
  const initialQuoteInvestment = new BigNumberInBase(
    formValues.value.investmentAmount
  )

  const ratio = currentPrice.value
    .minus(lowerBoundary)
    .dividedBy(upperBoundary.minus(lowerBoundary))

  const baseAmount = initialQuoteInvestment
    .times(new BigNumberInBase(1).minus(ratio))
    .dividedBy(currentPrice.value)

  const quoteAmount = initialQuoteInvestment.times(ratio)

  return { baseAmount, quoteAmount }
})

async function onCheckBalanceFees() {
  const { valid } = await validate()

  if (!valid) {
    return
  }

  if (
    formValues.value[SpotGridTradingField.InvestmentType] ===
    InvestmentTypeGst.BaseAndQuote
  ) {
    onCreateStrategy()

    return
  }

  const minAmount = new BigNumberInBase(formValues.value.grids || 1).times(
    GST_MIN_TRADING_SIZE
  )

  const isBaseLtBalance = baseDenomAmount.value.lt(
    calculatedAmount.value.baseAmount
  )
  const isQuoteLtBalance = quoteDenomAmount.value.lt(
    calculatedAmount.value.quoteAmount
  )
  const isBaseGtMinAmount = minAmount.lt(calculatedAmount.value.baseAmount)

  if (isBaseLtBalance || isQuoteLtBalance || !isBaseGtMinAmount) {
    onCreateStrategy()
  } else {
    modalStore.openModal(Modal.SgtBalancedFees)
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
  emit(
    'investment-type:set',
    calculatedAmount.value.quoteAmount.toFixed(UI_DEFAULT_MIN_DISPLAY_DECIMALS),
    calculatedAmount.value.baseAmount.toFixed(UI_DEFAULT_MIN_DISPLAY_DECIMALS)
  )

  onCreateStrategy()
}
</script>

<template>
  <div>
    <AppButton
      :status="status"
      lg
      class="w-full font-sembold shadow-none select-none"
      :class="[
        hasActiveStrategy
          ? 'bg-gray-475 text-white hover:opacity-80 pointer-events-none'
          : 'bg-blue-500 text-white'
      ]"
      @click="onCheckBalanceFees"
    >
      <span v-if="hasActiveStrategy">{{ $t('sgt.inProgress') }}</span>
      <span v-else>{{ $t('sgt.create') }}</span>
    </AppButton>

    <p
      v-if="hasActiveStrategy"
      class="text-green-500 text-xs font-semibold mt-4"
    >
      {{ $t('sgt.yourStrategyIsOnTheMove') }}
    </p>
  </div>

  <ModalsSgtBalancedFees
    v-bind="{
      margin: formValues.investmentAmount!,
      baseAmount: calculatedAmount.baseAmount,
      quoteAmount: calculatedAmount.quoteAmount
    }"
    @investment-type:set="onInvestmentTypeSet"
    @strategy:create="onCreateStrategy"
  />
</template>
