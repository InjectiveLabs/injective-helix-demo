<script lang="ts" setup>
import { UiSpotMarketWithToken } from '@injectivelabs/sdk-ui-ts'
import { PropType } from 'nuxt/dist/app/compat/capi'

import {
  GridStrategyType,
  InvestmentTypeGst,
  Modal,
  SpotGridTradingForm
} from '@/types'
import { getSgtContractAddressFromSlug } from '@/app/utils/helpers'

defineProps({
  market: {
    type: Object as PropType<UiSpotMarketWithToken>,
    required: true
  }
})

const modalStore = useModalStore()
const walletStore = useWalletStore()
const gridStrategyStore = useGridStrategyStore()
useForm<SpotGridTradingForm>({
  keepValuesOnUnmount: true,
  initialValues: {
    investmentType: InvestmentTypeGst.BaseAndQuote
  }
})

const gridStrategies = [GridStrategyType.Auto, GridStrategyType.Manual]

const activeTab = ref(GridStrategyType.Auto)

const activeStrategy = computed(
  () =>
    gridStrategyStore.activeStrategies.find(
      (strategy) =>
        strategy.contractAddress ===
        getSgtContractAddressFromSlug(gridStrategyStore.spotMarket?.slug)
    )!
)

function onTabChange(tab: GridStrategyType) {
  activeTab.value = tab
}

function openGettingStartedModal() {
  modalStore.openModal(Modal.SgtBanner)
}
</script>

<template>
  <div class="min-w-0">
    <div>
      <div class="space-y-4">
        <PartialsGridStrategySpotFormActiveStrategy
          v-if="activeStrategy && walletStore.isUserWalletConnected"
          v-bind="{ activeStrategy, market }"
        />

        <template v-else>
          <div
            class="grid grid-cols-2 mb-4 border cursor-pointer font-semibold text-gray-500 bg-gray-900 overflow-hidden rounded-md select-none"
          >
            <AppSelectButton
              v-for="strategy in gridStrategies"
              :key="`grid-type-selector-${strategy}`"
              v-model="activeTab"
              :value="strategy"
            >
              <template #default="{ isActive }">
                <div
                  class="px-2 py-4 text-center"
                  :class="{
                    'bg-gray-800 text-white': isActive
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

          <div
            class="flex items-center space-x-2 text-blue-500 hover:underline cursor-pointer"
            @click="openGettingStartedModal"
          >
            <p>{{ $t('sgt.gettingStarted') }}</p>
            <AppTooltip />
          </div>

          <PartialsGridStrategySpotFormAuto
            v-if="activeTab === GridStrategyType.Auto"
            v-bind="{ market }"
            @update:tab="onTabChange"
          />

          <PartialsGridStrategySpotFormManual
            v-else-if="activeTab === GridStrategyType.Manual"
            v-bind="{ market }"
          />
        </template>

        <ModalsLiquidityCheckSpotGridAuth />
        <ModalsLiquidityCreateGridSpotStrategy />
      </div>
    </div>
  </div>
</template>
