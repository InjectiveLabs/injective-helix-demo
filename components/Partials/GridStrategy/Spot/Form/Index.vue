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

const hasActiveStrategy = computed(
  () => gridStrategyStore.activeStrategies.length > 0
)

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
        <PartialsGridStrategySpotFormActiveStrategy
          v-if="hasActiveStrategy && walletStore.isUserWalletConnected"
        />

        <template v-else>
          <PartialsGridStrategySpotFormLowerUpperPrice v-bind="{ market }" />
          <div>
            <PartialsGridStrategySpotFormGrids />
            <PartialsGridStrategySpotFormProfitPerGrid />
          </div>
          <PartialsGridStrategySpotFormInvestmentAmount v-bind="{ market }" />
          <PartialsGridStrategySpotFormAdvancedSettings />
        </template>

        <CommonUserNotConnectedNote
          v-if="
            !walletStore.isUserWalletConnected && !walletStore.injectiveAddress
          "
          cta
        />

        <template v-else>
          <PartialsGridStrategySpotFormCreate
            v-if="!hasActiveStrategy"
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
