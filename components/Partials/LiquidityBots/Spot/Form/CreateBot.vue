<script setup lang="ts">
import { Status, StatusType, BigNumberInBase } from '@injectivelabs/utils'

import {
  BotType,
  LiquidityBotField,
  LiquidityBotForm,
  LiquidityValues,
  UiMarketWithToken,
  UiSpotMarket
} from '@/types'
import * as EventTracker from '@/app/providers/mixpanel/EventTracker'

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
    .plus(
      new BigNumberInBase(
        liquidityFormValues.value[LiquidityBotField.QuoteAmount] || 0
      ).times(tokenStore.tokenUsdPrice(props.market.quoteToken))
    )
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
    .catch((e) => {
      if (e.message && e.originalMessage) {
        EventTracker.trackTradingBotError({
          wallet: sharedWalletStore.injectiveAddress,
          market: props.market.slug,
          baseAmount: liquidityFormValues.value[LiquidityBotField.BaseAmount]!,
          quoteAmount:
            liquidityFormValues.value[LiquidityBotField.QuoteAmount]!,
          lowerBound: props.liquidityValues.lowerBound.toFixed(),
          upperBound: props.liquidityValues.upperBound.toFixed(),
          upperTrailingBound:
            props.liquidityValues.trailingUpperBound.toFixed(),
          lowerTrailingBound:
            props.liquidityValues.trailingLowerBound.toFixed(),
          error: e.message || '',
          originalMessage: e.originalMessage || '',
          botType: BotType.LiquidityGrid
        })
      }

      $onError(e)
    })
    .finally(() => {
      status.setIdle()
    })
}
</script>

<template>
  <div>
    <AppConnectWallet
      v-if="!sharedWalletStore.isUserConnected"
      class="w-full"
      size="xl"
      block
    />

    <AppButton
      v-else
      size="lg"
      :disabled="Object.keys(formErrors).length > 0 || isAutoSignOrAuthzEnabled"
      :variant="Object.keys(formErrors).length ? 'primary-outline' : 'primary'"
      class="w-full"
      @click="openConfirmationModal"
    >
      <span v-if="isAutoSignOrAuthzEnabled">
        {{ $t('common.unauthorized') }}
      </span>
      <span v-else>{{ $t('liquidityBots.createBot') }}</span>
    </AppButton>

    <SharedModal v-model="confirmationModal">
      <template #header>
        <div class="text-2xl font-bold">
          {{ $t('tradingBots.botCreationConfirmation') }}
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
                <span> $</span>
              </div>
              <div v-if="liquidityFormValues.baseAmount" class="text-gray-500">
                {{ liquidityFormValues.baseAmount }}
                {{ market.baseToken.symbol }}
              </div>
              <div v-if="liquidityFormValues.quoteAmount" class="text-gray-500">
                {{ liquidityFormValues.quoteAmount }}
                {{ market.quoteToken.symbol }}
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
