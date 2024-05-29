<script setup lang="ts">
import { Status, StatusType } from '@injectivelabs/utils'
import {
  spotMarketKey,
  SpotGridTradingForm,
  SpotGridTradingField
} from '@/types'
import { mixpanelAnalytics } from '~/app/providers/mixpanel'

const market = inject(spotMarketKey)

const validate = useValidateForm()
const formErrors = useFormErrors()
const gridStrategyStore = useGridStrategyStore()
const spotFormValues = useFormValues<SpotGridTradingForm>()
const { $onError } = useNuxtApp()
const { success } = useNotifications()
const { t } = useLang()

const status = reactive(new Status(StatusType.Idle))

const isDisabled = computed(() => {
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

  if (!valid) {
    return
  }

  status.setLoading()

  gridStrategyStore
    .createStrategy(spotFormValues.value, market!.value!)
    .then(() => {
      success({ title: t('common.success') })

      mixpanelAnalytics.trackCreateStrategy({
        formValues: spotFormValues.value,
        market: market?.value?.slug ?? '',
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
  g
  <div class="py-4">
    <AppButton
      class="w-full"
      v-bind="{ status, disabled: isDisabled }"
      @click="createStrategy"
    >
      {{ $t('sgt.create') }}
    </AppButton>
  </div>
</template>
