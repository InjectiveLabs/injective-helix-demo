<script setup lang="ts">
import { Status, StatusType } from '@injectivelabs/utils'
import { addressAndMarketSlugToSubaccountId } from '@/app/utils/helpers'
import { derivativeGridMarkets } from '@/app/json'
import {
  DerivativeGridTradingField,
  DerivativeGridTradingForm,
  MarketKey,
  UiDerivativeMarket
} from '@/types'

const market = inject(MarketKey) as Ref<UiDerivativeMarket>

const appStore = useAppStore()
const formErrors = useFormErrors()
const validate = useValidateForm()
const sharedWalletStore = useSharedWalletStore()
const gridStrategyStore = useGridStrategyStore()
const notificationStore = useSharedNotificationStore()
const derivativeFormValues = useFormValues<DerivativeGridTradingForm>()
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
      notificationStore.success({ title: t('common.success') })
    })
    .catch($onError)
    .finally(() => {
      status.setIdle()
    })
}

function removeStrategy() {
  const subaccountId = addressAndMarketSlugToSubaccountId(
    sharedWalletStore.address,
    market.value.slug
  )

  const scAddress = derivativeGridMarkets.find(
    ({ slug }) => slug === market.value.slug
  )!.contractAddress

  gridStrategyStore.removeStrategyForSubaccount(scAddress, subaccountId)
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

      <span
        v-else-if="sharedWalletStore.isAutoSignEnabled"
        class="text-xs text-red-500"
      >
        {{ $t('common.notAvailableinAutoSignMode') }}
      </span>

      <span v-else>{{ $t('sgt.create') }}</span>
    </AppButton>

    <AppButton
      v-if="appStore.devMode"
      variant="danger-shade"
      class="w-full mt-2"
      @click="removeStrategy"
    >
      Remove Strategy
    </AppButton>
  </div>
</template>
