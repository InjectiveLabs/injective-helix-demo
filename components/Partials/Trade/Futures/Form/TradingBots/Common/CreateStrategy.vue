<script setup lang="ts">
import { Status, StatusType } from '@injectivelabs/utils'
import { MarketKey, DerivativeGridTradingField } from '@/types'
import type { UiDerivativeMarket, DerivativeGridTradingForm } from '@/types'

const market = inject(MarketKey) as Ref<UiDerivativeMarket>

const validate = useValidateForm()
const formErrors = useFormErrors()
const jsonStore = useSharedJsonStore()
const sharedWalletStore = useSharedWalletStore()
const gridStrategyStore = useGridStrategyStore()
const notificationStore = useSharedNotificationStore()
const derivativeFormValues = useFormValues<DerivativeGridTradingForm>()
const { t } = useLang()
const { $onError } = useNuxtApp()

const props = withDefaults(
  defineProps<{
    error: boolean
  }>(),
  {}
)

const status = reactive(new Status(StatusType.Idle))

const isDisabled = computed(() => {
  if (sharedWalletStore.isAuthzWalletConnected) {
    return true
  }

  if (Object.keys(formErrors.value).length > 0 || props.error) {
    return true
  }

  return !derivativeFormValues.value[DerivativeGridTradingField.Margin]
})

async function createStrategy() {
  const { valid } = await validate()

  if (!valid || !market.value) {
    return
  }

  status.setLoading()

  await gridStrategyStore
    .createPerpStrategy(derivativeFormValues.value, market.value)
    .then(() => {
      notificationStore.update({
        title: t('toast.tradingBots.tradingBotCreatedSuccessfully')
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
      v-bind="{ status, disabled: isDisabled || jsonStore.isPostUpgradeMode }"
      @click="createStrategy"
    >
      <span v-if="jsonStore.isPostUpgradeMode">
        {{ $t('trade.postOnlyWarning') }}
      </span>

      <span v-else-if="sharedWalletStore.isAuthzWalletConnected">
        {{ $t('common.unauthorized') }}
      </span>

      <span v-else>{{ $t('tradingBots.createStrategy') }}</span>
    </AppButton>
  </div>
</template>
