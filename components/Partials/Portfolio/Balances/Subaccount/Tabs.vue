<script setup lang="ts">
import { ZERO_IN_BASE } from '@shared/utils/constant'
import {
  BigNumberInWei,
  BigNumberInBase,
  Status,
  StatusType
} from '@injectivelabs/utils'
import { UI_DEFAULT_MIN_DISPLAY_DECIMALS } from '@/app/utils/constants'
import { isSgtSubaccountId } from '~/app/utils/helpers'

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

const appStore = useAppStore()
const accountStore = useAccountStore()
const { aggregatedPortfolioBalances } = useBalance()
const { $onError } = useNuxtApp()
const { success } = useNotifications()
const { t } = useLang()

const status = reactive(new Status(StatusType.Idle))

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

function transferToMain() {
  status.setLoading()

  accountStore
    .withdrawToMain()
    .then(() => {
      success({ title: t('common.success') })
    })
    .catch($onError)
    .finally(() => {
      status.setIdle()
    })
}

const isGridTradingAccount = computed(() =>
  isSgtSubaccountId(accountStore.subaccountId)
)

const accountHasBalances = computed(
  () =>
    accountStore.subaccountBalancesMap[accountStore.subaccountId]?.filter(
      (balance) =>
        new BigNumberInBase(balance.availableBalance)
          .dp(0, BigNumberInBase.ROUND_DOWN)
          .gt(0)
    ).length > 0
)
</script>

<template>
  <div class="lg:h-header lg:flex grid grid-cols-1 lg:divide-x max-lg:divide-y">
    <CommonSubaccountTabSelector
      v-bind="{
        includeBotsSubaccounts:
          appStore.userState.preferences.showGridTradingSubaccounts
      }"
      wrapper-class="py-4 w-full "
    />

    <div class="flex items-center">
      <p
        class="text-xs text-gray-300 px-4 max-lg:py-3 flex items-center space-x-2 font-mono"
      >
        <span>{{ $t('account.total') }}: </span>
        <CommonSkeletonSubaccountAmount>
          <span>${{ accountTotalBalanceInUsdToString }}</span>
        </CommonSkeletonSubaccountAmount>
      </p>
    </div>

    <label class="flex px-4 flex-1 min-w-0">
      <div class="flex items-center">
        <SharedIcon is-md name="search" class="text-gray-500" />
      </div>
      <input
        v-model="search"
        class="p-2 bg-transparent min-w-0 focus:outline-none flex-1 shrink-[2]"
        placeholder="Filter by asset"
      />
    </label>

    <div
      v-if="isGridTradingAccount"
      class="flex items-center px-2 max-lg:py-2 [&>*]:flex-1"
    >
      <AppButton
        size="xs"
        class="whitespace-nowrap w-full"
        :disabled="!accountHasBalances"
        @click="transferToMain"
      >
        {{ $t('portfolio.balances.transferToMain') }}
      </AppButton>
    </div>

    <div class="flex items-center px-2 max-md:py-2 shrink-0 overflow-hidden">
      <AppCheckbox2 v-model="showUnverifiedAssets">
        {{ $t('account.showUnverifiedAssets') }}
      </AppCheckbox2>
    </div>
  </div>
</template>
