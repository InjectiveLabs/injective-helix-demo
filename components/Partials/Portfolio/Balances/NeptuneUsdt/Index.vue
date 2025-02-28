<script lang="ts" setup>
import { Status, StatusType, BigNumberInBase } from '@injectivelabs/utils'
import { usdtToken } from '@shared/data/token'
import { toBalanceInToken } from '@/app/utils/formatters'
import { UI_DEFAULT_MIN_DISPLAY_DECIMALS } from '@/app/utils/constants'
import { Modal, BusEvents } from '@/types'

const route = useRoute()
const isMobile = useIsMobile()
const tokenStore = useTokenStore()
const accountStore = useAccountStore()
const modalStore = useSharedModalStore()
const sharedWalletStore = useSharedWalletStore()
const { $onError } = useNuxtApp()

const isLend = ref(true)
const status = reactive(new Status(StatusType.Loading))

const peggyUsdtBalance = computed(() =>
  toBalanceInToken({
    value: accountStore.balancesMap[usdtToken.denom],
    decimalPlaces: usdtToken.decimals,
    fixedDecimals: UI_DEFAULT_MIN_DISPLAY_DECIMALS
  })
)

const neptuneUsdtBalance = computed(() =>
  toBalanceInToken({
    value: accountStore.neptuneUsdtInBankBalance,
    decimalPlaces: usdtToken.decimals,
    fixedDecimals: UI_DEFAULT_MIN_DISPLAY_DECIMALS
  })
)

const { valueToString: neptuneUsdtBalanceInUsd } = useSharedBigNumberFormatter(
  computed(() =>
    new BigNumberInBase(neptuneUsdtBalance.value).times(
      tokenStore.tokenUsdPrice(usdtToken)
    )
  ),
  {
    decimalPlaces: UI_DEFAULT_MIN_DISPLAY_DECIMALS
  }
)

const { valueToString: neptuneLendingApyToString } =
  useSharedBigNumberFormatter(
    computed(() =>
      new BigNumberInBase(accountStore.neptuneUsdtLendingApy).times(100)
    ),
    {
      decimalPlaces: UI_DEFAULT_MIN_DISPLAY_DECIMALS
    }
  )

onMounted(() => {
  if (route.query.depositUsdt) {
    onOpenDepositModal()
  }

  useEventBus(BusEvents.NeptuneUsdt).on(() => {
    onOpenDepositModal()
  })

  status.setLoading()

  accountStore
    .fetchNeptuneLendingApy()
    .catch($onError)
    .finally(() => {
      status.setIdle()
    })
})

function onOpenDepositModal() {
  isLend.value = true
  modalStore.openModal(Modal.NeptuneUsdt)
}

function onOpenWithdrawalModal() {
  isLend.value = false
  modalStore.openModal(Modal.NeptuneUsdt)
}
</script>

<template>
  <div class="border border-brand-800 px-6 py-4 rounded-lg mt-10 mb-14">
    <div class="mb-4">{{ $t('trade.neptuneUsdt.automatedYields') }}</div>

    <div v-if="!isMobile" class="flex justify-between">
      <div class="flex p-4 gap-x-12">
        <div class="flex items-center space-x-1 mr-10">
          <CommonTokenIcon v-bind="{ token: usdtToken }" />
          <p class="font-semibold text-sm">{{ usdtToken.symbol }}</p>
        </div>

        <div class="flex flex-col gap-y-2">
          <div class="text-sm font-semibold text-coolGray-450">
            {{ $t('trade.neptuneUsdt.apy') }}
          </div>
          <div class="text-white text-xs">{{ neptuneLendingApyToString }}%</div>
        </div>

        <div class="flex flex-col gap-y-2">
          <div class="text-sm font-semibold text-coolGray-450">
            {{ $t('trade.neptuneUsdt.available') }}
          </div>
          <div class="text-white text-xs">{{ peggyUsdtBalance }}</div>
        </div>

        <div class="flex flex-col gap-y-2">
          <div class="text-sm font-semibold text-coolGray-450">
            {{ $t('trade.neptuneUsdt.total') }}
          </div>
          <div>
            <div class="text-white text-xs">{{ neptuneUsdtBalance }}</div>
            <div class="text-coolGray-475 text-xs">
              ${{ neptuneUsdtBalanceInUsd }}
            </div>
          </div>
        </div>
      </div>

      <AppTooltip
        :is-disabled="
          !sharedWalletStore.isAuthzWalletConnected &&
          !sharedWalletStore.isAutoSignEnabled
        "
        :content="$t('trade.neptuneUsdt.disabled')"
      >
        <div class="flex items-center gap-2">
          <AppButton
            class="bg-brand-700 text-white border-none focus-within:ring-[0px]"
            v-bind="{
              size: 'xs',
              disabled:
                sharedWalletStore.isAuthzWalletConnected ||
                sharedWalletStore.isAutoSignEnabled
            }"
            @click="onOpenDepositModal"
          >
            {{ $t('trade.neptuneUsdt.deposit') }}
          </AppButton>
          <AppButton
            class="bg-brand-700 text-white border-none focus-within:ring-[0px]"
            v-bind="{
              size: 'xs',
              disabled:
                sharedWalletStore.isAuthzWalletConnected ||
                sharedWalletStore.isAutoSignEnabled
            }"
            @click="onOpenWithdrawalModal"
          >
            {{ $t('trade.neptuneUsdt.withdraw') }}
          </AppButton>
        </div>
      </AppTooltip>
    </div>

    <div v-else class="p-4 space-y-4">
      <div class="flex items-center gap-2 mb-6">
        <CommonTokenIcon v-bind="{ token: usdtToken }" />
        <p class="font-semibold text-sm">{{ usdtToken.symbol }}</p>
      </div>

      <div class="flex justify-between text-sm">
        <span class="text-coolGray-450">{{ $t('trade.neptuneUsdt.apy') }}</span>
        <span class="text-white">{{ neptuneLendingApyToString }}%</span>
      </div>

      <div class="flex justify-between text-sm">
        <span class="text-coolGray-450">{{
          $t('trade.neptuneUsdt.available')
        }}</span>
        <span class="text-white">{{ peggyUsdtBalance }}</span>
      </div>

      <div class="flex justify-between text-sm">
        <span class="text-coolGray-450">{{
          $t('trade.neptuneUsdt.total')
        }}</span>
        <div class="text-right">
          <div class="text-white">{{ neptuneUsdtBalance }}</div>
          <div class="text-coolGray-475">${{ neptuneUsdtBalanceInUsd }}</div>
        </div>
      </div>

      <AppTooltip
        :is-disabled="
          !sharedWalletStore.isAuthzWalletConnected &&
          !sharedWalletStore.isAutoSignEnabled
        "
        :content="$t('trade.neptuneUsdt.disabled')"
      >
        <div class="flex gap-2 mt-6">
          <AppButton
            class="bg-brand-700 text-white border-none w-full"
            v-bind="{
              size: 'xs',
              disabled:
                sharedWalletStore.isAuthzWalletConnected ||
                sharedWalletStore.isAutoSignEnabled
            }"
            @click="onOpenDepositModal"
          >
            {{ $t('trade.neptuneUsdt.deposit') }}
          </AppButton>
          <AppButton
            class="bg-brand-700 text-white border-none w-full"
            v-bind="{
              size: 'xs',
              disabled:
                sharedWalletStore.isAuthzWalletConnected ||
                sharedWalletStore.isAutoSignEnabled
            }"
            @click="onOpenWithdrawalModal"
          >
            {{ $t('trade.neptuneUsdt.withdraw') }}
          </AppButton>
        </div>
      </AppTooltip>
    </div>

    <ModalsNeptuneUsdt v-bind="{ isLend }" />
  </div>
</template>
