<script setup lang="ts">
import { Status, StatusType, BigNumberInBase } from '@injectivelabs/utils'
import * as EventTracker from '@/app/providers/mixpanel/EventTracker'
import { BotType, LiquidityBotField } from '@/types'
import type {
  UiSpotMarket,
  LiquidityValues,
  LiquidityBotForm,
  UiMarketWithToken
} from '@/types'

const props = withDefaults(
  defineProps<{
    market: UiMarketWithToken
    liquidityValues: LiquidityValues
  }>(),
  {}
)

const jsonStore = useSharedJsonStore()
const sharedTokenStore = useSharedTokenStore()
const sharedWalletStore = useSharedWalletStore()
const gridStrategyStore = useGridStrategyStore()
const notificationStore = useSharedNotificationStore()
const validate = useValidateForm<LiquidityBotForm>()
const formErrors = useFormErrors<LiquidityBotForm>()
const liquidityFormValues = useFormValues<LiquidityBotForm>()
const { t } = useLang()
const { $onError } = useNuxtApp()

const hasConfirmed = ref(false)
const confirmationModal = ref(false)
const status = reactive(new Status(StatusType.Idle))

const totalUsd = computed(() =>
  new BigNumberInBase(
    liquidityFormValues.value[LiquidityBotField.BaseAmount] || 0
  )
    .times(sharedTokenStore.tokenUsdPrice(props.market.baseToken))
    .plus(
      new BigNumberInBase(
        liquidityFormValues.value[LiquidityBotField.QuoteAmount] || 0
      ).times(sharedTokenStore.tokenUsdPrice(props.market.quoteToken))
    )
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
      grids,
      lowerBound: lowerBound.toFixed(),
      upperBound: upperBound.toFixed(),
      market: props.market as UiSpotMarket,
      upperTrailingBound: trailingUpperBound.toFixed(),
      lowerTrailingBound: trailingLowerBound.toFixed(),
      baseAmount: liquidityFormValues.value[LiquidityBotField.BaseAmount],
      quoteAmount: liquidityFormValues.value[LiquidityBotField.QuoteAmount]
    })
    .then(() => {
      EventTracker.trackCreateStrategy({
        isLiquidity: true,
        market: props.market.slug,
        marketPrice: sharedTokenStore
          .tokenUsdPrice(props.market.baseToken)
          .toFixed(),
        formValues: {
          grids: String(props.liquidityValues.grids),
          lowerPrice: props.liquidityValues.lowerBound.toFixed(),
          upperPrice: props.liquidityValues.upperBound.toFixed(),
          trailingLower: props.liquidityValues.trailingLowerBound.toFixed(),
          trailingUpper: props.liquidityValues.trailingUpperBound.toFixed(),
          baseInvestmentAmount:
            liquidityFormValues.value[LiquidityBotField.BaseAmount],
          quoteInvestmentAmount:
            liquidityFormValues.value[LiquidityBotField.QuoteAmount]
        }
      })

      confirmationModal.value = false

      notificationStore.update({
        title: t('toast.success'),
        description: t('toast.tradingBots.tradingBotCreatedSuccessfully')
      })

      status.setIdle()
    })
    .catch((e) => {
      if (e.message && e.originalMessage) {
        EventTracker.trackTradingBotError({
          error: e.message || '',
          market: props.market.slug,
          botType: BotType.LiquidityGrid,
          originalMessage: e.originalMessage || '',
          wallet: sharedWalletStore.injectiveAddress,
          grids: String(props.liquidityValues.grids),
          lowerBound: props.liquidityValues.lowerBound.toFixed(),
          upperBound: props.liquidityValues.upperBound.toFixed(),
          baseAmount: liquidityFormValues.value[LiquidityBotField.BaseAmount]!,
          quoteAmount:
            liquidityFormValues.value[LiquidityBotField.QuoteAmount]!,
          upperTrailingBound:
            props.liquidityValues.trailingUpperBound.toFixed(),
          lowerTrailingBound: props.liquidityValues.trailingLowerBound.toFixed()
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
      block
      size="xl"
    />

    <AppButton
      v-else
      size="lg"
      class="w-full"
      :disabled="
        Object.keys(formErrors).length > 0 || jsonStore.isPostUpgradeMode
      "
      :variant="Object.keys(formErrors).length ? 'primary-outline' : 'primary'"
      @click="openConfirmationModal"
    >
      <span v-if="jsonStore.isPostUpgradeMode">
        {{ $t('trade.postOnlyWarning') }}
      </span>
      <span v-else>{{ $t('tradingBots.liquidityBots.createBot') }}</span>
    </AppButton>

    <AppModal
      v-model="confirmationModal"
      v-bind="{ isSm: true, isHideCloseButton: true }"
    >
      <!-- <template #title>
        <div class="text-xl font-bold">
          {{ $t('tradingBots.botCreationConfirmation') }}
        </div>
      </template> -->

      <div class="space-y-4 text-sm">
        <!-- <p class="text-gray-300 mb-6">
          {{ $t('tradingBots.confirmationDescription') }}
        </p> -->

        <div class="space-y-4">
          <div class="flex justify-between items-start">
            <span class="text-gray-400">{{
              $t('tradingBots.investment')
            }}</span>
            <div class="text-right">
              <div class="text-lg">
                <SharedUsdAmount :amount="totalUsd.toFixed()">
                  <template #prefix>$ </template>
                </SharedUsdAmount>
              </div>
              <div class="flex items-center gap-1 text-coolGray-500">
                <div v-if="liquidityFormValues.baseAmount">
                  {{ liquidityFormValues.baseAmount }}
                  {{ market.baseToken.symbol }}
                </div>
                /
                <div v-if="liquidityFormValues.quoteAmount">
                  {{ liquidityFormValues.quoteAmount }}
                  {{ market.quoteToken.symbol }}
                </div>
              </div>
            </div>
          </div>

          <div class="flex justify-between items-center">
            <span class="text-gray-400">{{ $t('trade.market') }}</span>
            <span>{{ market.ticker }}</span>
          </div>

          <div class="flex justify-between items-center">
            <span class="text-gray-400">{{ $t('tradingBots.gridMode') }}</span>
            <span>{{ $t('tradingBots.sgt.modes.arithmetic_lp') }}</span>
          </div>

          <div class="flex justify-between items-center">
            <span class="text-gray-400">{{
              $t('tradingBots.priceRange')
            }}</span>
            <span>
              {{ liquidityValues.lowerBound.toFixed() }}-{{
                liquidityValues.upperBound.toFixed()
              }}
            </span>
          </div>

          <div class="flex justify-between items-center">
            <span class="text-gray-400">{{
              $t('tradingBots.trailingPriceRange')
            }}</span>
            <span>
              {{ liquidityValues.trailingLowerBound.toFixed() }}-{{
                liquidityValues.trailingUpperBound.toFixed()
              }}
            </span>
          </div>

          <div class="flex justify-between items-center">
            <span class="text-gray-400">{{
              $t('tradingBots.gridNumber')
            }}</span>
            <span>{{ liquidityValues.grids }}</span>
          </div>
        </div>

        <div class="mt-6 flex items-center">
          <UCheckbox
            v-model="hasConfirmed"
            :label="$t('tradingBots.disclaimer')"
          />
        </div>

        <SharedButton
          class="mt-6"
          block
          variant="solid"
          v-bind="{
            disabled: !hasConfirmed,
            loading: status.isLoading()
          }"
          @click="createLiquidityBot"
        >
          {{ $t('common.confirm') }}
        </SharedButton>
      </div>
    </AppModal>
  </div>
</template>
