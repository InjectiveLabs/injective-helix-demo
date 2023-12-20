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
  initialValues: { investmentType: InvestmentTypeGst.BaseAndQuote }
})

const activeTab = ref(GridStrategyType.Auto)

const activeStrategy = computed(
  () =>
    gridStrategyStore.activeStrategies.find(
      (strategy) =>
        strategy.contractAddress ===
        getSgtContractAddressFromSlug(gridStrategyStore.spotMarket?.slug)
    )!
)

function changeTab(tab: GridStrategyType) {
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
            <div
              class="px-2 py-4 text-center"
              :class="{
                'bg-gray-800 text-white': activeTab === GridStrategyType.Auto
              }"
              @click="changeTab(GridStrategyType.Auto)"
            >
              {{ $t('sgt.auto') }}
            </div>

            <div
              class="px-2 py-4 text-center"
              :class="{
                'bg-gray-800 text-white': activeTab === GridStrategyType.Manual
              }"
              @click="changeTab(GridStrategyType.Manual)"
            >
              {{ $t('sgt.manual') }}
            </div>
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
            @set:tab="changeTab"
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
