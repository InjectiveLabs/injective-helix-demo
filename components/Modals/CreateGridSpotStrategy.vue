<script setup lang="ts">
import { Status, StatusType, BigNumberInBase } from '@injectivelabs/utils'
import { ZERO_IN_BASE } from '@injectivelabs/sdk-ui-ts'
import { Modal, SpotGridTradingForm } from '@/types'

const gridStore = useGridStore()
const modalStore = useModalStore()
const tokenStore = useTokenStore()
const formValues = useFormValues<SpotGridTradingForm>()
const { success } = useNotifications()
const { $onError } = useNuxtApp()
const { t } = useLang()

const status = reactive(new Status(StatusType.Idle))
const isAggreedToTerms = ref(false)

const profitPerGrid = computed(() => {
  if (
    !formValues.value.lowerPrice ||
    !formValues.value.upperPrice ||
    !formValues.value.grids ||
    !formValues.value.investmentAmount ||
    !gridStore.market ||
    Number(formValues.value.grids) === 0
  ) {
    return ZERO_IN_BASE
  }

  // We get wrong values in testnet
  const quotePriceInUsd = new BigNumberInBase(
    tokenStore.tokenUsdPriceMap[gridStore.market?.baseToken.coinGeckoId]
  )

  return new BigNumberInBase(
    Number(formValues.value.upperPrice) - Number(formValues.value.lowerPrice)
  )
    .dividedBy(formValues.value.grids)
    .dividedBy(quotePriceInUsd.dividedBy(formValues.value.investmentAmount))
})

const symbol = computed(() => gridStore.market?.quoteToken.symbol)

const { valueToString: profitPerGridToString } = useBigNumberFormatter(
  profitPerGrid,
  { decimals: 2 }
)

function closeModal() {
  modalStore.closeModal(Modal.CreateSpotGridStrategy)
}

function handleCreateStrategy() {
  status.setLoading()

  gridStore
    .createStrategy({
      amount: formValues.value.investmentAmount!,
      levels: Number(formValues.value.grids!),
      lowerBound: formValues.value.lowerPrice!,
      upperBound: formValues.value.upperPrice!
    })
    .then(() => {
      success({
        title: t('sgt.success'),
        description: t('sgt.gridStrategyCreatedSuccesfully')
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
    :show="modalStore.modals[Modal.CreateSpotGridStrategy]"
    @modal:closed="closeModal"
  >
    <template #title>
      <p class="[text-transform:none] text-lg font-bold p-2">
        {{ $t('sgt.gridOrderConfirmation') }}
      </p>
    </template>

    <div class="max-w-sm">
      <p>
        {{
          $t(
            'sgt.pleaseReadTheBelowInformationCarefullyBeforeYouConfirmToProceed'
          )
        }}
      </p>

      <div class="mt-6 space-y-1">
        <div class="flex justify-between items-center">
          <p class="text-gray-500">{{ $t('sgt.tradeAmount') }}</p>
          <p class="font-semibold">
            {{ formValues.investmentAmount }} {{ symbol }}
          </p>
        </div>

        <div class="flex justify-between items-center">
          <p class="text-gray-500">{{ $t('sgt.market') }}</p>
          <p class="font-semibold">{{ gridStore.market?.ticker }}</p>
        </div>
        <div class="flex justify-between items-center">
          <p class="text-gray-500">{{ $t('sgt.gridMode') }}</p>
          <p class="font-semibold">{{ $t('sgt.arithmetic') }}</p>
        </div>
        <div class="flex justify-between items-center">
          <p class="text-gray-500">{{ $t('sgt.priceRange') }}</p>
          <p class="font-semibold">
            {{ formValues.lowerPrice }} - {{ formValues.upperPrice }}
            {{ symbol }}
          </p>
        </div>
        <div class="flex justify-between items-center">
          <p class="text-gray-500">{{ $t('sgt.gridNumber') }}</p>
          <p class="font-semibold">{{ formValues.grids }}</p>
        </div>
        <div class="flex justify-between items-center">
          <p class="text-gray-500">{{ $t('sgt.profitGrid') }}</p>
          <p class="font-semibold">{{ profitPerGridToString }} {{ symbol }}</p>
        </div>
      </div>

      <div class="flex my-6">
        <div class="mt-1 mx-2">
          <AppCheckbox v-model="isAggreedToTerms" />
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
          :disabled="!isAggreedToTerms"
          class="bg-blue-500 disabled:bg-gray-500 w-full"
          @click="handleCreateStrategy"
        >
          {{ $t('sgt.confirm') }}
        </AppButton>
      </div>
    </div>
  </AppModal>
</template>
