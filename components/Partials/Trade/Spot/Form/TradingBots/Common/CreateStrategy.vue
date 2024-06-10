<script setup lang="ts">
import { Status, StatusType } from '@injectivelabs/utils'
import { mixpanelAnalytics } from '@/app/providers/mixpanel'
import {
  MarketKey,
  UiSpotMarket,
  SpotGridTradingForm,
  SpotGridTradingField
} from '@/types'

const market = inject(MarketKey) as Ref<UiSpotMarket>

const validate = useValidateForm()
const formErrors = useFormErrors()
const walletStore = useWalletStore()
const gridStrategyStore = useGridStrategyStore()
const spotFormValues = useFormValues<SpotGridTradingForm>()
const { $onError } = useNuxtApp()
const notificationStore = useSharedNotificationStore()
const { t } = useLang()

const status = reactive(new Status(StatusType.Idle))

const isDisabled = computed(() => {
  if (walletStore.isAutoSignEnabled || walletStore.isAuthzWalletConnected) {
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

  gridStrategyStore
    .createStrategy(spotFormValues.value, market.value)
    .then(() => {
      notificationStore.success({ title: t('common.success') })

      mixpanelAnalytics.trackCreateStrategy({
        formValues: spotFormValues.value,
        market: market.value.slug || '',
        marketPrice: '4',
        isLiquidity: false
      })
    })
    .catch($onError)
    .finally(() => {
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
      <span v-if="walletStore.isAuthzWalletConnected">
        {{ $t('common.unauthorized') }}
      </span>
      <span v-else>{{ $t('sgt.create') }}</span>
    </AppButton>

    <span v-if="walletStore.isAutoSignEnabled" class="text-xs text-red-500">
      {{ $t('common.notAvailableinAutoSignMode') }}
    </span>
  </div>
</template>
