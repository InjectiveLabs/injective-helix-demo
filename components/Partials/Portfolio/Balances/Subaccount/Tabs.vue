<script setup lang="ts">
import { NuxtUiIcons } from '@shared/types'
import { isPgtSubaccountId, isSgtSubaccountId } from '@/app/utils/helpers'
import { StrategyStatus, PortfolioCyTags } from '@/types'

const props = withDefaults(
  defineProps<{
    search?: string
    showUnverifiedAssets?: boolean
  }>(),
  {
    search: ''
  }
)

const emit = defineEmits<{
  'update:search': [value: string]
  'update:showUnverifiedAssets': [value: boolean]
}>()

const appStore = useAppStore()
const accountStore = useAccountStore()
const gridStrategyStore = useGridStrategyStore()
const { activeSubaccountTotalBalanceInUsd } = useBalance()

const search = computed({
  get: () => props.search,
  set: (value: string) => emit('update:search', value)
})

const showUnverifiedAssets = computed({
  get: () => props.showUnverifiedAssets,
  set: (value: boolean) => emit('update:showUnverifiedAssets', value)
})

const isGridTradingAccount = computed(() => {
  const activeStrategy = gridStrategyStore.strategies.find(
    ({ subaccountId }) => subaccountId === accountStore.subaccountId
  )

  return (
    (isSgtSubaccountId(accountStore.subaccountId) ||
      isPgtSubaccountId(accountStore.subaccountId)) &&
    activeStrategy?.state !== StrategyStatus.Active
  )
})

const { valueToBigNumber: accountTotalBalanceInUsdToBigNumber } =
  useSharedBigNumberFormatter(
    computed(() => activeSubaccountTotalBalanceInUsd.value)
  )
</script>

<template>
  <div class="lg:h-header lg:flex grid grid-cols-1 lg:divide-x max-lg:divide-y">
    <CommonSubaccountTabSelector
      v-bind="{
        includeBotsSubaccounts:
          appStore.userState.preferences.showGridTradingSubaccounts,
        showLowBalance: true
      }"
      wrapper-class="py-4 w-full "
    />

    <div class="flex items-center">
      <p
        class="text-xs text-coolGray-300 px-4 max-lg:py-3 flex items-center space-x-2"
      >
        <span>{{ $t('common.total') }}: </span>
        <CommonSkeletonSubaccountAmount>
          <span :data-cy="dataCyTag(PortfolioCyTags.SubAccountTotalBalance)">
            <SharedAmountUsd
              v-bind="{
                amount: accountTotalBalanceInUsdToBigNumber.toFixed()
              }"
              :data-cy="dataCyTag(PortfolioCyTags.BalanceTotalValue)"
            >
              <template #prefix>
                <span>$</span>
              </template>
            </SharedAmountUsd>
          </span>
        </CommonSkeletonSubaccountAmount>
      </p>
    </div>

    <label class="flex px-4 flex-1 min-w-0">
      <div class="flex items-center">
        <UIcon
          :name="NuxtUiIcons.Search"
          class="h-4 w-4 min-w-4 text-coolGray-500"
        />
      </div>
      <input
        v-model="search"
        :placeholder="$t('portfolio.filters.byAsset')"
        :data-cy="dataCyTag(PortfolioCyTags.AssetSearch)"
        class="p-2 bg-transparent min-w-0 focus:outline-none flex-1 shrink-[2]"
      />
    </label>

    <div
      v-if="isGridTradingAccount"
      class="flex items-center px-2 max-lg:py-2 [&>*]:flex-1"
    >
      <PartialsPortfolioBalancesSubaccountTransferToMain />
    </div>

    <div class="flex items-center px-2 max-md:py-2 shrink-0 overflow-hidden">
      <AppCheckbox v-model="showUnverifiedAssets">
        {{ $t('portfolio.showUnverifiedAssets') }}
      </AppCheckbox>
    </div>
  </div>
</template>
