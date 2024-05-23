<script setup lang="ts">
import { ZERO_IN_BASE } from '@shared/utils/constant'
import { BigNumberInWei } from '@injectivelabs/utils'
import { UI_DEFAULT_MIN_DISPLAY_DECIMALS } from '@/app/utils/constants'

const props = defineProps({
  search: {
    type: String,
    default: ''
  },

  showUnverifiedAssets: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits<{
  'update:search': [value: string]
  'update:showUnverifiedAssets': [value: boolean]
}>()

const accountStore = useAccountStore()
const { aggregatedPortfolioBalances } = useBalance()

const search = computed({
  get: () => props.search,
  set: (value: string) => emit('update:search', value)
})

const showUnverifiedAssets = computed({
  get: () => props.showUnverifiedAssets,
  set: (value: boolean) => emit('update:showUnverifiedAssets', value)
})

const { valueToString: accountTotalBalanceInUsdToString } =
  useSharedBigNumberFormatter(
    computed(
      () =>
        aggregatedPortfolioBalances.value[accountStore.subaccountId]?.reduce(
          (total, balance) =>
            total.plus(
              new BigNumberInWei(balance.accountTotalBalanceInUsd).toBase(
                balance.token.decimals
              )
            ),
          ZERO_IN_BASE
        ) || ZERO_IN_BASE
    ),
    {
      decimalPlaces: UI_DEFAULT_MIN_DISPLAY_DECIMALS
    }
  )
</script>

<template>
  <div class="lg:h-header lg:flex grid grid-cols-2 divide-x">
    <CommonSubaccountTabSelector wrapper-class="py-4 w-full max-lg:border-b" />

    <div class="flex items-center max-lg:border-b">
      <p class="text-sm text-gray-300 px-4 flex items-center space-x-2">
        <span>{{ $t('account.total') }}: </span>
        <CommonSkeletonSubaccountAmount>
          <span>${{ accountTotalBalanceInUsdToString }}</span>
        </CommonSkeletonSubaccountAmount>
      </p>
    </div>

    <label class="flex px-4 flex-1">
      <div class="flex items-center">
        <SharedIcon name="search" class="text-gray-500" />
      </div>
      <input
        v-model="search"
        class="p-2 bg-transparent focus:outline-none flex-1"
        placeholder="Filter by asset"
      />
    </label>

    <div class="flex items-center px-4">
      <AppCheckbox2 v-model="showUnverifiedAssets">
        {{ $t('account.showUnverifiedAssets') }}
      </AppCheckbox2>
    </div>
  </div>
</template>
