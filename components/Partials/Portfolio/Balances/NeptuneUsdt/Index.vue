<script lang="ts" setup>
import { NuxtUiIcons } from '@shared/types'
import { usdtToken } from '@shared/data/token'
import { DEFAULT_USD_DECIMALS } from '@shared/utils/constant'
import { sharedToBalanceInToken } from '@shared/utils/formatter'
import {
  Status,
  BigNumber,
  StatusType,
  BigNumberInBase
} from '@injectivelabs/utils'
import { Modal, BusEvents } from '@/types'

const route = useRoute()
const appStore = useAppStore()
const accountStore = useAccountStore()
const modalStore = useSharedModalStore()
const { $onError } = useNuxtApp()

const isLend = ref(true)
const status = reactive(new Status(StatusType.Loading))

const peggyUsdtBalance = computed(() =>
  sharedToBalanceInToken({
    decimalPlaces: usdtToken.decimals,
    fixedDecimals: DEFAULT_USD_DECIMALS,
    value: accountStore.balancesMap[usdtToken.denom]
  })
)

const neptuneBalance = computed(() =>
  sharedToBalanceInToken({
    decimalPlaces: usdtToken.decimals,
    fixedDecimals: DEFAULT_USD_DECIMALS,
    value: accountStore.neptuneUsdtInBankBalance
  })
)

const neptuneLendingApy = computed(() =>
  new BigNumberInBase(accountStore.neptuneUsdtLendingApy).times(100)
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
  <article
    class="border border-brand-800 p-6 pb-8 rounded-lg mt-10 grid md:grid-cols-3 gap-4 bg-coolGray-850"
  >
    <div class="md:col-span-2">
      <h1 class="text-2xl font-semibold">
        {{ $t('trade.neptuneUsdt.automatedYields') }}
      </h1>

      <i18n-t
        tag="p"
        keypath="trade.neptuneUsdt.description"
        class="text-coolGray-450 text-sm max-w-screen-md"
      >
        <template #link>
          <NuxtLink
            to="https://nept.finance/"
            target="_blank"
            class="text-blue-500 hover:opacity-80 hover:text-opacity-80"
          >
            {{ $t('trade.neptuneUsdt.neptune') }}
          </NuxtLink>
        </template>
      </i18n-t>

      <div class="py-6 flex items-center gap-2">
        <CommonTokenIcon v-bind="{ isLg: true, token: usdtToken }" />
        <span class="font-semibold">{{ usdtToken.symbol }}</span>
        <div
          class="bg-green-650 p-1 rounded max-h-6 flex items-center text-xs leading-3 font-semibold gap-1 ml-2"
        >
          <span>
            {{ $t('trade.neptuneUsdt.apy') }}
          </span>
          <span>
            <SharedAmountUsd
              v-bind="{
                amount: neptuneLendingApy,
                roundingMode: BigNumber.ROUND_HALF_UP
              }"
            />%
          </span>
          <AppTooltip :text="$t('trade.neptuneUsdt.apyTooltip')">
            <UIcon :name="NuxtUiIcons.Info2" class="w-3.5 h-3.5" />
          </AppTooltip>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div class="space-y-2">
          <div class="text-coolGray-450 font-semibold">
            {{ $t('trade.neptuneUsdt.available') }}
          </div>
          <div>
            <SharedAmount
              class="text-white"
              v-bind="{
                amount: peggyUsdtBalance
              }"
            />
            <span class="ml-1">{{ usdtToken.symbol }}</span>
          </div>
        </div>

        <div class="flex flex-col space-y-2">
          <div class="font-semibold text-coolGray-450">
            {{ $t('trade.neptuneUsdt.deposited') }}
          </div>
          <div>
            <SharedAmount
              class="text-white"
              v-bind="{
                amount: neptuneBalance
              }"
            />
            <span class="ml-1">{{ usdtToken.symbol }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="flex items-end gap-4 w-full justify-end">
      <AppButton
        size="lg"
        class="w-full"
        is-full-width
        variant="primary-outline"
        :disabled="appStore.isCountryRestricted"
        @click="onOpenDepositModal"
      >
        {{ $t('trade.neptuneUsdt.deposit') }}
      </AppButton>

      <AppButton
        size="lg"
        class="w-full"
        is-full-width
        variant="primary-outline"
        @click="onOpenWithdrawalModal"
      >
        {{ $t('trade.neptuneUsdt.withdraw') }}
      </AppButton>
    </div>

    <ModalsNeptuneUsdt v-bind="{ isLend }" />
  </article>
</template>
