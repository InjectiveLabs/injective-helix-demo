<script setup lang="ts">
import { UiSpotMarketWithToken } from '@injectivelabs/sdk-ui-ts'
import { PropType } from 'nuxt/dist/app/compat/capi'
import {
  InvestmentTypeGst,
  SpotGridTradingField,
  SpotGridTradingForm
} from '@/types'

const walletStore = useWalletStore()

defineProps({
  market: {
    type: Object as PropType<UiSpotMarketWithToken>,
    required: true
  }
})

const { setFieldValue } = useForm<SpotGridTradingForm>()

function onFormValuesUpdate(
  investmentAmount: string,
  baseInvestmentAmount: string
) {
  setFieldValue(SpotGridTradingField.InvestmentAmount, investmentAmount)
  setFieldValue(SpotGridTradingField.BaseInvestmentAmount, baseInvestmentAmount)
  setFieldValue(
    SpotGridTradingField.InvestmentType,
    InvestmentTypeGst.BaseAndQuote
  )
}
</script>

<template>
  <div class="min-w-0">
    <div>
      <div class="space-y-4">
        <PartialsGridStrategySpotFormLowerUpperPrice v-bind="{ market }" />
        <PartialsGridStrategySpotFormGrids />
        <PartialsGridStrategySpotFormProfitPerGrid />
        <PartialsGridStrategySpotFormInvestmentAmount v-bind="{ market }" />

        <CommonUserNotConnectedNote
          v-if="
            !walletStore.isUserWalletConnected && !walletStore.injectiveAddress
          "
          cta
        />

        <PartialsGridStrategySpotFormCreate
          v-else
          @form-values:update="onFormValuesUpdate"
        />

        <ModalsCheckSpotGridAuth />
        <ModalsCreateGridSpotStrategy />
      </div>
    </div>
  </div>
</template>
