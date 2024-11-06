<script lang="ts" setup>
import {
  GridStrategyType,
  InvestmentTypeGst,
  SpotGridTradingForm
} from '@/types'

useForm<SpotGridTradingForm>({
  keepValuesOnUnmount: true,
  initialValues: { investmentType: InvestmentTypeGst.Base }
})

const gridStrategies = [GridStrategyType.Auto, GridStrategyType.Manual]

const activeTab = ref(GridStrategyType.Auto)
</script>

<template>
  <div>
    <div class="grid grid-cols-2 bg-black p-1 rounded-md text-sm my-6">
      <AppSelectButton
        v-for="strategy in gridStrategies"
        :key="`grid-type-selector-${strategy}`"
        v-model="activeTab"
        :value="strategy"
      >
        <template #default="{ isActive }">
          <div
            class="rounded py-1.5 uppercase text-center"
            :class="{
              'bg-coolGray-800': isActive
            }"
          >
            <span v-if="strategy === GridStrategyType.Auto">
              {{ $t('sgt.auto') }}
            </span>
            <span v-else>
              {{ $t('sgt.manual') }}
            </span>
          </div>
        </template>
      </AppSelectButton>
    </div>

    <PartialsLiquidityBotsSpotCreateAuto
      v-if="activeTab === GridStrategyType.Auto"
    />
    <PartialsLiquidityBotsSpotCreateManual v-else />

    <ModalsLiquidityCreateGridSpotStrategy v-bind="{ isLiquidity: true }" />
  </div>
</template>
