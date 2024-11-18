<script setup lang="ts">
import { Status, StatusType, BigNumberInBase } from '@injectivelabs/utils'
import {
  LiquidityBotField,
  LiquidityBotForm,
  LiquidityValues,
  UiMarketWithToken,
  UiSpotMarket
} from '@/types'

const props = withDefaults(
  defineProps<{
    market: UiMarketWithToken
    liquidityValues: LiquidityValues
  }>(),
  {}
)

const tokenStore = useTokenStore()
const sharedWalletStore = useSharedWalletStore()
const gridStrategyStore = useGridStrategyStore()
const validate = useValidateForm<LiquidityBotForm>()
const formErrors = useFormErrors<LiquidityBotForm>()
const liquidityFormValues = useFormValues<LiquidityBotForm>()
const { $onError } = useNuxtApp()

const hasConfirmed = ref(false)
const confirmationModal = ref(false)
const status = reactive(new Status(StatusType.Idle))

const totalUsd = computed(() =>
  new BigNumberInBase(
    liquidityFormValues.value[LiquidityBotField.BaseAmount] || 0
  )
    .times(tokenStore.tokenUsdPrice(props.market.baseToken))
    .plus(liquidityFormValues.value[LiquidityBotField.QuoteAmount] || 0)
    .times(tokenStore.tokenUsdPrice(props.market.quoteToken))
)

const isAutoSignOrAuthzEnabled = computed(
  () =>
    sharedWalletStore.isAuthzWalletConnected ||
    sharedWalletStore.isAutoSignEnabled
)

async function openConfirmationModal() {
  const { valid } = await validate()

  if (!valid) {
    return
  }

  confirmationModal.value = true
}

async function createLiquidityBot() {
  const { valid } = await validate()

  if (
    (!liquidityFormValues.value.baseAmount &&
      !liquidityFormValues.value.quoteAmount) ||
    !valid
  ) {
    return
  }

  status.setLoading()

  const {
    grids,
    lowerBound,
    upperBound,
    trailingLowerBound,
    trailingUpperBound
  } = props.liquidityValues

  gridStrategyStore
    .createSpotLiquidityBot({
      market: props.market as UiSpotMarket,
      grids,
      lowerBound: lowerBound.toFixed(),
      upperBound: upperBound.toFixed(),
      upperTrailingBound: trailingUpperBound.toFixed(),
      lowerTrailingBound: trailingLowerBound.toFixed(),
      baseAmount: liquidityFormValues.value[LiquidityBotField.BaseAmount],
      quoteAmount: liquidityFormValues.value[LiquidityBotField.QuoteAmount]
    })
    .then(() => {
      status.setIdle()
    })
    .catch($onError)
    .finally(() => {
      status.setIdle()
    })
}
</script>

<template>
  <div>
    <UButton
      :disabled="Object.keys(formErrors).length > 0 || isAutoSignOrAuthzEnabled"
      :variant="Object.keys(formErrors).length > 0 ? 'outline' : 'solid'"
      block
      @click="openConfirmationModal"
    >
      <span v-if="isAutoSignOrAuthzEnabled">
        {{ $t('common.unauthorized') }}
      </span>
      <span v-else>{{ $t('liquidityBots.createBot') }}</span>
    </UButton>

    <SharedModal v-model="confirmationModal">
      <template #header>
        <div class="text-2xl font-bold">
          {{ $t('sgt.confirmationTitle') }}
        </div>
      </template>

      <div class="space-y-4 p-4 text-sm">
        <p class="text-gray-300 mb-6">
          {{ $t('sgt.confirmationDescription') }}
        </p>

        <div class="space-y-4">
          <div class="flex justify-between items-start">
            <span class="text-gray-400">{{ $t('sgt.investment') }}</span>
            <div class="text-right">
              <div class="text-lg">
                <SharedUsdAmount :amount="totalUsd.toFixed()" />
                <span> USDT</span>
              </div>
              <div class="text-gray-500">
                {{ liquidityFormValues.baseAmount }} INJ
              </div>
              <div class="text-gray-500">
                {{ liquidityFormValues.quoteAmount }} USDT
              </div>
            </div>
          </div>

          <div class="flex justify-between items-center">
            <span class="text-gray-400">{{ $t('sgt.market') }}</span>
            <span>{{ market.ticker }}</span>
          </div>

          <div class="flex justify-between items-center">
            <span class="text-gray-400">{{ $t('sgt.gridMode') }}</span>
            <span>Arithmetic LP</span>
          </div>

          <div class="flex justify-between items-center">
            <span class="text-gray-400">{{ $t('sgt.priceRange') }}</span>
            <span>
              {{ liquidityValues.lowerBound.toFixed() }}-{{
                liquidityValues.upperBound.toFixed()
              }}
            </span>
          </div>

          <div class="flex justify-between items-center">
            <span class="text-gray-400">{{
              $t('sgt.trailingPriceRange')
            }}</span>
            <span>
              {{ liquidityValues.trailingLowerBound.toFixed() }}-{{
                liquidityValues.trailingUpperBound.toFixed()
              }}
            </span>
          </div>

          <div class="flex justify-between items-center">
            <span class="text-gray-400">{{ $t('sgt.gridNumber') }}</span>
            <span>{{ liquidityValues.grids }}</span>
          </div>
        </div>

        <div class="mt-6 flex items-center">
          <UCheckbox v-model="hasConfirmed" :label="$t('sgt.disclaimer')" />
        </div>

        <SharedButton
          :loading="status.isLoading()"
          class="mt-6"
          variant="solid"
          block
          :disabled="!hasConfirmed"
          @click="createLiquidityBot"
        >
          {{ $t('sgt.confirm') }}
        </SharedButton>
      </div>
    </SharedModal>
  </div>
</template>
