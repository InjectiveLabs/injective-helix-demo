<script setup lang="ts">
import { Status, StatusType } from '@injectivelabs/utils'
import { sharedToBalanceInTokenInBase } from '@shared/utils/formatter'
import * as EventTracker from '@/app/providers/mixpanel/EventTracker'
import {
  MarketKey,
  UiSpotMarket,
  SpotGridTradingForm,
  SpotGridTradingField
} from '@/types'

const market = inject(MarketKey) as Ref<UiSpotMarket>

const spotStore = useSpotStore()
const validate = useValidateForm()
const formErrors = useFormErrors()
const sharedWalletStore = useSharedWalletStore()
const gridStrategyStore = useGridStrategyStore()
const notificationStore = useSharedNotificationStore()
const spotFormValues = useFormValues<SpotGridTradingForm>()
const { t } = useLang()
const { $onError } = useNuxtApp()

const status = reactive(new Status(StatusType.Idle))

const isDisabled = computed(() => {
  if (
    sharedWalletStore.isAutoSignEnabled ||
    sharedWalletStore.isAuthzWalletConnected
  ) {
    return true
  }

  if (Object.keys(formErrors.value).length > 0) {
    return true
  }

  return (
    !spotFormValues.value[SpotGridTradingField.BaseInvestmentAmount] &&
    !spotFormValues.value[SpotGridTradingField.QuoteInvestmentAmount]
  )
})

async function createStrategy() {
  const { valid } = await validate()

  if (!valid || !market.value) {
    return
  }

  status.setLoading()

  let err: Error

  gridStrategyStore
    .createStrategy(spotFormValues.value, market.value)
    .then(() => {
      notificationStore.success({ title: t('common.success') })
    })
    .catch((e) => {
      err = e
      $onError(e)
    })
    .finally(async () => {
      const lastTrade = await spotStore.fetchLastTrade({
        marketId: market.value.marketId
      })

      const lastTradedPrice = sharedToBalanceInTokenInBase({
        value: lastTrade.price,
        decimalPlaces:
          market.value.quoteToken.decimals - market.value.baseToken.decimals
      })

      EventTracker.trackCreateStrategy({
        error: err?.message,
        formValues: spotFormValues.value,
        market: market.value.slug || '',
        marketPrice: lastTradedPrice.toFixed(market.value.priceDecimals),
        isLiquidity: false
      })

      status.setIdle()
    })
}
</script>

<template>
  <div class="py-4">
    <AppButton
      class="w-full"
      v-bind="{ status, disabled: isDisabled }"
      @click="createStrategy"
    >
      <span v-if="sharedWalletStore.isAuthzWalletConnected">
        {{ $t('common.unauthorized') }}
      </span>
      <span v-else>{{ $t('sgt.create') }}</span>
    </AppButton>

    <span
      v-if="sharedWalletStore.isAutoSignEnabled"
      class="text-xs text-red-500"
    >
      {{ $t('common.notAvailableinAutoSignMode') }}
    </span>
  </div>
</template>
