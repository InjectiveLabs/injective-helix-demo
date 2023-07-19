<script setup lang="ts">
import { UiSpotMarketWithToken } from '@injectivelabs/sdk-ui-ts'
import { PropType } from 'nuxt/dist/app/compat/capi'
import { SpotGridTradingForm } from '@/types'

defineProps({
  market: {
    type: Object as PropType<UiSpotMarketWithToken>,
    required: true
  }
})

const { errors: formErrors } = useForm<SpotGridTradingForm>()
</script>

<template>
  <pre>
    {{ formErrors }}
  </pre>
  <div class="space-y-2">
    <PartialsGridTradingSpotFormLowerUpperPrice />

    <PartialsGridTradingSpotFormGrids />

    <PartialsGridTradingSpotFormProfitPerGrid />

    <PartialsGridTradingSpotFormInvestmentAmount v-bind="{ market }" />

    <PartialsGridTradingSpotFormCreate />
  </div>
</template>
