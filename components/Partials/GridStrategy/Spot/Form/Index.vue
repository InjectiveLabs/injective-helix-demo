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

const gridStrategyStore = useGridStrategyStore()

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
        <PartialsGridStrategySpotFormHeader
          v-if="gridStrategyStore.activeStrategies.length > 0"
        />
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

        <template v-else>
          <PartialsGridStrategySpotFormCreate
            v-if="gridStrategyStore.activeStrategies.length === 0"
            v-bind="{ market }"
            @investment-type:set="onFormValuesUpdate"
          />

          <PartialsGridStrategySpotFormEndBot v-else />
        </template>

        <ModalsCheckSpotGridAuth />
        <ModalsCreateGridSpotStrategy />
      </div>
    </div>
  </div>
</template>
