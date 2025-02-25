<script lang="ts" setup>
import { usdtToken } from '@shared/data/token'
import { NEPTUNE_USDT_CW20_CONTRACT } from '@injectivelabs/sdk-ts'
import { Status, StatusType, BigNumberInBase } from '@injectivelabs/utils'
import { neptuneService } from '@/app/Services'
import { toBalanceInToken } from '@/app/utils/formatters'
import { UI_DEFAULT_DISPLAY_DECIMALS } from '@/app/utils/constants'
import { Modal, MainPage, NeptuneUsdtForm, NeptuneUsdtField } from '@/types'

const accountStore = useAccountStore()
const modalStore = useSharedModalStore()
const notificationStore = useSharedNotificationStore()
const { t } = useLang()
const { $onError } = useNuxtApp()

const {
  validate,
  values: formValues,
  setValues: setFormValues,
  resetForm: resetTransferForm
} = useForm<NeptuneUsdtForm>({
  keepValuesOnUnmount: true
})

const props = withDefaults(
  defineProps<{
    isLend: boolean
  }>(),
  {}
)

const tokenSelectorRef = ref()
const status = reactive(new Status(StatusType.Idle))

const balance = computed(() => ({
  token: usdtToken,
  denom: usdtToken.denom,
  balance: props.isLend
    ? accountStore.balancesMap[usdtToken.denom]
    : String(accountStore.neptuneUsdtInBankBalance)
}))

const withdrawAmount = computed(() => {
  const neptuneUsdtBalanceInCw20 =
    accountStore.cw20Balances.find(
      (balance) => balance.address === NEPTUNE_USDT_CW20_CONTRACT
    )?.amount || ''

  const isMaxWithdraw =
    tokenSelectorRef.value?.maxBalanceToString ===
    formValues[NeptuneUsdtField.Amount]

  return isMaxWithdraw
    ? neptuneUsdtBalanceInCw20
    : new BigNumberInBase(
        neptuneService.calculateCw20Amount(
          Number(formValues[NeptuneUsdtField.Amount]),
          accountStore.neptuneUsdtRedemptionRatio
        )
      )
        .toWei(usdtToken.decimals)
        .toFixed()
})

function resetForm() {
  resetTransferForm({
    values: {
      [NeptuneUsdtField.Amount]: ''
    }
  })
}

async function onSubmit() {
  const { valid } = await validate()

  if (!valid) {
    return
  }

  status.setLoading()

  const action = props.isLend
    ? accountStore.convertPeggyToNeptuneUsdt
    : accountStore.convertNeptuneToPeggyUsdt

  action(
    props.isLend ? formValues[NeptuneUsdtField.Amount] : withdrawAmount.value
  )
    .then(() => {
      notificationStore.success({
        title: t(
          `trade.neptuneUsdt.success.${props.isLend ? 'deposit' : 'withdraw'}`
        )
      })
      resetForm()
      closeModal()
    })
    .catch($onError)
    .finally(() => {
      status.setIdle()
    })
}

function closeModal() {
  modalStore.closeModal(Modal.NeptuneUsdt)
  resetForm()
}

function setWithdrawMax() {
  status.setLoading()

  accountStore
    .fetchNeptuneRedemptionRatio()
    .then(() => {
      setFormValues({
        [NeptuneUsdtField.Amount]: toBalanceInToken({
          decimalPlaces: usdtToken.decimals,
          roundingMode: BigNumberInBase.ROUND_DOWN,
          fixedDecimals: UI_DEFAULT_DISPLAY_DECIMALS,
          value: accountStore.neptuneUsdtInBankBalance
        })
      })
    })
    .catch($onError)
    .finally(() => status.setIdle())
}

function onUpdateMax({ amount }: { amount: string }) {
  if (props.isLend) {
    setFormValues({
      [NeptuneUsdtField.Amount]: amount
    })

    return
  }

  setWithdrawMax()
}
</script>

<template>
  <SharedModal v-model="modalStore.modals[Modal.NeptuneUsdt]">
    <template #title>
      <h3 class="normal-case text-2xl font-semibold tracking-[0.4px]">
        {{
          $t(
            `trade.neptuneUsdt.${
              isLend ? 'depositToNeptune' : 'withdrawFromNeptune'
            }`
          )
        }}
      </h3>
    </template>

    <div class="pt-8">
      <AppSelectToken
        v-bind="{
          maxDecimals: UI_DEFAULT_DISPLAY_DECIMALS,
          token: balance,
          isRequired: true,
          options: [balance],
          denom: usdtToken.denom,
          isTooltipDisabled: true,
          isTokenSelectorDisabled: true,
          amountFieldName: NeptuneUsdtField.Amount
        }"
        ref="tokenSelectorRef"
        @update:max="onUpdateMax"
      >
        <span> {{ $t('account.amount') }} </span>
      </AppSelectToken>

      <ModalsNeptuneUsdtSubmit
        class="mt-6"
        v-bind="{ status }"
        @submit="onSubmit"
      />

      <i18n-t
        keypath="trade.neptuneUsdt.warningText"
        tag="div"
        class="text-coolGray-450 text-xs leading-4 tracking-[0.4px] mt-6 max-w-[500px]"
      >
        <template #terms>
          <NuxtLink
            :to="{
              name: MainPage.Terms
            }"
            target="_blank"
            class="hover:opacity-50 underline cursor-pointer"
          >
            {{ $t('trade.neptuneUsdt.termsAndConditions') }}
          </NuxtLink>
        </template>
      </i18n-t>
    </div>
  </SharedModal>
</template>
