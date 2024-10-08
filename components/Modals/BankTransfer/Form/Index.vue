<script lang="ts" setup>
import { BigNumberInBase, Status, StatusType } from '@injectivelabs/utils'
import { injToken } from '@shared/data/token'
import { Wallet } from '@injectivelabs/wallet-ts'
import { UI_DEFAULT_DISPLAY_DECIMALS } from '@/app/utils/constants'
import { BankTransferField } from '@/types'

const tokenStore = useTokenStore()
const accountStore = useAccountStore()
const { userBalancesWithToken } = useBalance()
const setBankTransferFormValues = useSetFormValues()
const { $onError } = useNuxtApp()

// todo: see if design wants search functionality
const search = ref('')
const fetchAddressStatus = reactive(new Status(StatusType.Idle))

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
  const balances = userBalancesWithToken.value.map(
    ({ denom, token, availableMargin }) => {
      return {
        denom,
        token,
        balance: availableMargin
      }
    }
  )

  return balances
})

const balancesSorted = computed(() => {
  const filteredBalances = balances.value.filter((balance) => {
    const isIncludedInSymbol = balance.token.symbol
      .toLowerCase()
      .includes(search.value.toLowerCase())

    const isIncludedInName = balance.token.name
      .toLowerCase()
      .includes(search.value.toLowerCase())

    const isPartOfSearch =
      !search.value || isIncludedInSymbol || isIncludedInName
    const hasBalance = new BigNumberInBase(balance.balance).gte(1)

    return hasBalance && isPartOfSearch
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
    .finally(() => {
      fetchAddressStatus.setIdle()
    })
}
</script>

<template>
  <div>
    <div class="mb-4">
      <AppInput
        v-model="injAddressValue"
        v-bind="{
          placeholder: $t('portfolio.bankTransfer.enterAddress')
        }"
        class="text-xs"
      >
        <template v-if="injAddressValue" #addon>
          <SharedIcon name="close" is-md @click="resetInjAddressValue" />
        </template>
      </AppInput>

      <!--todo: refactor buttons according to eventual design-->
      <div class="flex gap-2">
        <SharedIcon
          is-md
          :name="`wallet/metamask`"
          class="w-6 h-6 min-w-6"
          @click="onWalletSelected(Wallet.Metamask)"
        />
        <SharedIcon
          is-md
          :name="`wallet/keplr`"
          class="w-6 h-6 min-w-6"
          @click="onWalletSelected(Wallet.Keplr)"
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
      <div class="text-xs leading-4 tracking-wide text-gray-200">
        {{ $t('portfolio.bankTransfer.doubleCheck') }}
      </div>
    </AppCheckbox>

    <ModalsBankTransferFormSubmit
      class="mt-4"
      v-bind="{ ...$attrs, fetchAddressStatus }"
    />
  </div>
</template>
