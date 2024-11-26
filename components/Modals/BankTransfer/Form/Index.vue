<script lang="ts" setup>
import { injToken } from '@shared/data/token'
import { Wallet } from '@injectivelabs/wallet-base'
import { isCosmosWalletInstalled } from '@injectivelabs/wallet-cosmos'
import { BigNumberInBase, Status, StatusType } from '@injectivelabs/utils'
import { NuxtUiIcons } from '@shared/types'
import { UI_DEFAULT_DISPLAY_DECIMALS } from '@/app/utils/constants'
import { WalletOption, BankTransferField } from '@/types'

const tokenStore = useTokenStore()
const accountStore = useAccountStore()
const sharedWalletStore = useSharedWalletStore()
const setBankTransferFormValues = useSetFormValues()
const { $onError } = useNuxtApp()
const { activeSubaccountBalancesWithToken } = useBalance()

const fetchAddressStatus = reactive(new Status(StatusType.Idle))

const walletOptions = computed(
  () =>
    [
      {
        wallet: Wallet.Keplr,
        downloadLink: !isCosmosWalletInstalled(Wallet.Keplr)
          ? 'https://www.keplr.app/download'
          : undefined
      },
      {
        wallet: Wallet.Metamask,
        downloadLink: !sharedWalletStore.metamaskInstalled
          ? 'https://metamask.io/download'
          : undefined
      }
    ].filter((option) => option) as WalletOption[]
)

const { value: denomValue } = useStringField({
  name: BankTransferField.Denom,
  rule: ''
})

const {
  value: injAddressValue,
  errors: injAddressErrors,
  resetField: resetInjAddressValue
} = useStringField({
  name: BankTransferField.Address,
  rule: 'injAddress'
})

const { value: doubleCheck } = useBooleanField({
  name: BankTransferField.DoubleCheck
})

const balances = computed(() => {
  const balances = activeSubaccountBalancesWithToken.value.map(
    ({ denom, token, availableBalance }) => {
      return {
        denom,
        token,
        balance: availableBalance
      }
    }
  )

  return balances
})

const balancesSorted = computed(() => {
  const filteredBalances = balances.value.filter((balance) => {
    const hasBalance = new BigNumberInBase(balance.balance).gte(1)

    return hasBalance
  })

  return filteredBalances.sort((a, b) => {
    const aBalanceInToken = sharedToBalanceInTokenInBase({
      value: a.balance,
      decimalPlaces: a.token.decimals
    })

    const bBalanceInToken = sharedToBalanceInTokenInBase({
      value: b.balance,
      decimalPlaces: b.token.decimals
    })

    if (b.denom === injToken.denom) {
      return 1
    }

    return aBalanceInToken.gt(bBalanceInToken) ? -1 : 1
  })
})

const maxDecimals = computed(() => {
  const token = tokenStore.tokenByDenomOrSymbol(denomValue.value)

  if (!token) {
    return UI_DEFAULT_DISPLAY_DECIMALS
  }

  const defaultDecimalsLessThanTokenDecimals =
    UI_DEFAULT_DISPLAY_DECIMALS < token.decimals

  if (defaultDecimalsLessThanTokenDecimals) {
    return UI_DEFAULT_DISPLAY_DECIMALS
  }

  return token.decimals
})

onMounted(() => {
  fetchAddressStatus.setLoading()

  Promise.all([sharedWalletStore.checkIsMetamaskInstalled()]).then(() =>
    fetchAddressStatus.setIdle()
  )
})

function onAmountChange({ amount }: { amount: string }) {
  setBankTransferFormValues(
    {
      [BankTransferField.Amount]: amount
    },
    false
  )
}

function onTokenChange() {
  setBankTransferFormValues(
    {
      [BankTransferField.Amount]: ''
    },
    false
  )
}

function onWalletSelected(wallet: Wallet) {
  fetchAddressStatus.setLoading()

  accountStore
    .fetchAddressFromWalletStrategy(wallet)
    .then((address?: string) => {
      injAddressValue.value = address || ''
    })
    .catch($onError)
    .finally(() => fetchAddressStatus.setIdle())
}
</script>

<template>
  <div>
    <div class="mb-4">
      <div class="p-2 py-3 max-h-xs space-y-3 bg-coolGray-950 rounded-md">
        <AppInput
          v-model="injAddressValue"
          v-bind="{
            isTransparentBg: true,
            placeholder: $t('portfolio.bankTransfer.enterAddress')
          }"
          class="text-xs"
        >
          <template v-if="injAddressValue" #addon>
            <UIcon
              :name="NuxtUiIcons.Close"
              class="h-6 w-6 min-w-6"
              @click="resetInjAddressValue"
            />
          </template>
        </AppInput>
      </div>

      <div class="flex items-center gap-2 mt-4">
        <ModalsBankTransferWalletSelectorItem
          v-for="item in walletOptions"
          v-bind="{ walletOption: item }"
          :key="`magic-transfer-wallet-${item.wallet}`"
          @wallet:selected="onWalletSelected"
        />
      </div>

      <p
        v-if="injAddressErrors[0]"
        class="first-letter:uppercase text-red-500 text-xs mt-1"
      >
        {{ injAddressErrors[0] }}
      </p>
    </div>

    <AppSelectToken
      v-model:denom="denomValue"
      v-bind="{
        maxDecimals,
        isRequired: true,
        amountFieldName: BankTransferField.Amount,
        options: balancesSorted
      }"
      @update:max="onAmountChange"
      @update:denom="onTokenChange"
    >
      <span> {{ $t('account.amount') }} </span>
    </AppSelectToken>

    <ModalsBankTransferFormMemo />

    <AppCheckbox v-model="doubleCheck">
      <div class="text-xs leading-4 tracking-wide text-coolGray-200">
        {{ $t('portfolio.bankTransfer.doubleCheck') }}
      </div>
    </AppCheckbox>

    <ModalsBankTransferFormSubmit
      class="mt-4"
      v-bind="{ ...$attrs, fetchAddressStatus }"
    />
  </div>
</template>
