<script setup lang="ts">
import { Status, StatusType, BigNumberInBase } from '@injectivelabs/utils'
import { ZERO_IN_BASE } from '@injectivelabs/sdk-ui-ts'
import { Modal, SpotGridTradingForm } from '@/types'

const modalStore = useModalStore()
const tokenStore = useTokenStore()
const gridStrategyStore = useGridStrategyStore()
const formValues = useFormValues<SpotGridTradingForm>()
const { success } = useNotifications()
const { $onError } = useNuxtApp()
const { t } = useLang()

const status = reactive(new Status(StatusType.Idle))
const hasAgreedToTerms = ref(false)

const profitPerGrid = computed(() => {
  if (
    !formValues.value.lowerPrice ||
    !formValues.value.upperPrice ||
    !formValues.value.grids ||
    !formValues.value.investmentAmount ||
    !gridStrategyStore.spotMarket ||
    Number(formValues.value.grids) === 0
  ) {
    return ZERO_IN_BASE
  }

  // We get wrong values in testnet
  const quotePriceInUsd = new BigNumberInBase(
    tokenStore.tokenUsdPriceMap[
      gridStrategyStore.spotMarket.baseToken.coinGeckoId
    ]
  )

  return new BigNumberInBase(
    Number(formValues.value.upperPrice) - Number(formValues.value.lowerPrice)
  )
    .dividedBy(formValues.value.grids)
    .dividedBy(quotePriceInUsd.dividedBy(formValues.value.investmentAmount))
})

const quoteSymbol = computed(
  () => gridStrategyStore.spotMarket?.quoteToken.symbol
)
const baseSymbol = computed(
  () => gridStrategyStore.spotMarket?.baseToken.symbol
)

const { valueToString: profitPerGridToString } = useBigNumberFormatter(
  profitPerGrid,
  { decimalPlaces: 2 }
)

function closeModal() {
  modalStore.closeModal(Modal.CreateSpotGridStrategy)
}

function handleCreateStrategy() {
  status.setLoading()

  gridStrategyStore
    .createStrategy({
      levels: Number(formValues.value.grids!),
      quoteAmount: formValues.value.investmentAmount!,
      lowerBound: formValues.value.lowerPrice!,
      upperBound: formValues.value.upperPrice!,
      baseAmount: formValues.value.baseInvestmentAmount
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
    })
}
</script>
<template>
  <AppModal
    :is-open="modalStore.modals[Modal.CreateSpotGridStrategy]"
    @modal:closed="closeModal"
  >
    <template #title>
      <p class="[text-transform:none] text-lg font-bold p-2">
        {{ $t('sgt.gridOrderConfirmation') }}
      </p>
    </template>

    <div class="max-w-sm">
      <p>
        <span class="font-bold">
          {{ formValues.investmentAmount }} {{ quoteSymbol }}
        </span>
        <template v-if="formValues.baseInvestmentAmount">
          and
          <span class="font-bold">
            {{ formValues.baseInvestmentAmount }} {{ baseSymbol }}
          </span>
        </template>
        will be transferred from your main subaccount to your SGT INJ-USDT sub
        account.
      </p>

      <div class="mt-6 space-y-1">
        <div class="flex justify-between items-center">
          <p class="text-gray-500">{{ $t('sgt.tradeAmount') }}</p>
          <p class="font-semibold">
            {{ formValues.investmentAmount }} {{ quoteSymbol }}
          </p>
        </div>

        <div
          v-if="formValues.baseInvestmentAmount"
          class="flex justify-end items-center"
        >
          <p class="font-semibold">
            {{ formValues.baseInvestmentAmount }} {{ baseSymbol }}
          </p>
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
            {{ formValues.lowerPrice }} - {{ formValues.upperPrice }}
            {{ quoteSymbol }}
          </p>
        </div>
        <div class="flex justify-between items-center">
          <p class="text-gray-500">{{ $t('sgt.gridNumber') }}</p>
          <p class="font-semibold">{{ formValues.grids }}</p>
        </div>
        <div class="flex justify-between items-center">
          <p class="text-gray-500">{{ $t('sgt.profitGrid') }}</p>
          <p class="font-semibold">
            {{ profitPerGridToString }} {{ quoteSymbol }}
          </p>
        </div>
      </div>

      <div class="flex my-6">
        <div class="mt-1 mx-2">
          <AppCheckbox v-model="hasAgreedToTerms" />
        </div>
        <div>
          <p>
            {{ $t('sgt.termsAndConditions') }}
          </p>
        </div>
      </div>

      <div>
        <AppButton
          v-bind="{ status }"
          :disabled="!hasAgreedToTerms"
          class="bg-blue-500 disabled:bg-gray-500 w-full"
          @click="handleCreateStrategy"
        >
          {{ $t('sgt.confirm') }}
        </AppButton>
      </div>
    </div>
  </AppModal>
</template>
