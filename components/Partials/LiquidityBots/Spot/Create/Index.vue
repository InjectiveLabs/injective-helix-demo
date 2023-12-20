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

const activeTab = ref(GridStrategyType.Auto)

function changeTab(tab: GridStrategyType) {
  activeTab.value = tab
}
</script>

<template>
  <div>
    <div class="grid grid-cols-2 bg-black p-1 rounded-md text-sm my-6">
      <button
        class="rounded py-1.5 uppercase"
        :class="{ 'bg-gray-800': activeTab === GridStrategyType.Auto }"
        @click="changeTab(GridStrategyType.Auto)"
      >
        {{ $t('sgt.auto') }}
      </button>
      <button
        class="rounded py-1.5 uppercase"
        :class="{ 'bg-gray-800': activeTab === GridStrategyType.Manual }"
        @click="changeTab(GridStrategyType.Manual)"
      >
        {{ $t('sgt.manual') }}
      </button>
    </div>

    <PartialsLiquidityBotsSpotCreateAuto
      v-if="activeTab === GridStrategyType.Auto"
    />
    <PartialsLiquidityBotsSpotCreateManual v-else />

    <ModalsLiquidityCheckSpotGridAuth />
    <ModalsLiquidityCreateGridSpotStrategy v-bind="{ isLiquidity: true }" />
  </div>
</template>
