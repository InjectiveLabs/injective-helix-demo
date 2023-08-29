<script setup lang="ts">
import { BigNumberInBase, Status, StatusType } from '@injectivelabs/utils'
import { ZERO_IN_BASE } from '@injectivelabs/sdk-ui-ts'
import { Modal, SpotGridTradingForm } from '@/types'
import {
  gridStrategyAuthorizationMessageTypes,
  spotGridMarkets
} from '@/app/data/grid-strategy'

const emit = defineEmits<{
  'formValues:update': [investmentAmount: string, baseInvestmentAmount: string]
}>()

const authZStore = useAuthZStore()
const modalStore = useModalStore()
const gridStrategyStore = useGridStrategyStore()
const formValues = useFormValues<SpotGridTradingForm>()
const validate = useValidateForm()

const status = reactive(new Status(StatusType.Idle))
const isCalculatedValuesFlag = ref(true)

const hasActiveStrategy = computed(
  () => gridStrategyStore.activeStrategies.length > 0
)

const { lastTradedPrice: currentPrice } = useSpotLastPrice(
  computed(() => gridStrategyStore.spotMarket!)
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

const isCalculatedValuesShown = computed(
  () =>
    !!isCalculatedValuesFlag.value &&
    !!formValues.value.investmentAmount &&
    !!formValues.value.lowerPrice &&
    !!formValues.value.upperPrice
)

const { valueToString: baseAmountToString, valueToFixed: baseAmountToFixed } =
  useBigNumberFormatter(
    computed(() => calculatedAmount.value.baseAmount),
    { decimalPlaces: 2 }
  )

const { valueToString: quoteAmountToString, valueToFixed: quoteAmountToFixed } =
  useBigNumberFormatter(
    computed(() => calculatedAmount.value.quoteAmount),
    { decimalPlaces: 2 }
  )

async function onCreateStrategy() {
  const { valid } = await validate()

  if (!valid) {
    return
  }

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

function onSetValues() {
  emit('formValues:update', quoteAmountToFixed.value, baseAmountToFixed.value)
  nextTick(() => {
    isCalculatedValuesFlag.value = false
  })
}

watch(formValues.value, () => {
  isCalculatedValuesFlag.value = true
})
</script>

<template>
  <div class="pt-4">
    <div v-if="isCalculatedValuesShown" class="mb-4 text-green-500 text-sm">
      <p>Minimize one time strategy balancing fees by investing:</p>

      <div class="flex justify-between items-center">
        <div class="font-semibold pt-2">
          <p>{{ baseAmountToString }} INJ</p>
          <p>{{ quoteAmountToString }} USDT</p>
        </div>

        <div>
          <AppButton @click="onSetValues">Set Values</AppButton>
        </div>
      </div>
    </div>

    <AppButton
      :status="status"
      lg
      class="w-full font-sembold shadow-none select-none"
      :class="[
        hasActiveStrategy
          ? 'bg-gray-475 text-white hover:opacity-80 pointer-events-none'
          : 'bg-green-500 hover:text-green-900 text-green-800'
      ]"
      @click="onCreateStrategy"
    >
      <span v-if="hasActiveStrategy">{{ $t('sgt.inProgress') }}</span>
      <span v-else>{{ $t('sgt.create') }}</span>
    </AppButton>

    <p
      v-if="hasActiveStrategy"
      class="text-green-500 text-xs font-semibold mt-4"
    >
      Your strategy is on the move! Find all the details under the chart at the
      bottom right corner. If you're on a smaller screen, a quick scroll down
      might be needed to see everything.
    </p>
  </div>
</template>
