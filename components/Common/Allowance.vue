<script lang="ts" setup>
import { PropType } from 'vue'
import { Status, StatusType, BigNumberInBase } from '@injectivelabs/utils'
import {
  ZERO_IN_WEI,
  UNLIMITED_ALLOWANCE,
  BalanceWithTokenWithErc20Balance
} from '@injectivelabs/sdk-ui-ts'
import { BridgeForm, BridgeField } from '@/types'
import { allowanceResetSymbols } from '@/app/data/token'

const peggyStore = usePeggyStore()
const formValues = useFormValues<BridgeForm>()
const { $onError } = useNuxtApp()
const { success } = useNotifications()
const { t } = useLang()

const props = defineProps({
  allowance: {
    type: Object as PropType<BigNumberInBase>,
    required: true
  },

  balanceWithToken: {
    type: Object as PropType<BalanceWithTokenWithErc20Balance>,
    required: true
  }
})

const status = reactive(new Status(StatusType.Idle))

const hasNonUnlimitedAllowanceSet = computed(
  () => props.allowance.gt(0) && props.allowance.lt(UNLIMITED_ALLOWANCE)
)

const needsAllowanceReset = computed(() =>
  allowanceResetSymbols.includes(props.balanceWithToken.token.symbol)
)

function handleClickOnSetAllowance() {
  if (!props.balanceWithToken) {
    return
  }

  status.setLoading()

  return hasNonUnlimitedAllowanceSet.value
    ? handleSetZeroAllowance()
    : handleSetAllowance()
}

function handleSetZeroAllowance() {
  peggyStore
    .setTokenAllowance(
      props.balanceWithToken as BalanceWithTokenWithErc20Balance,
      ZERO_IN_WEI
    )
    .then(() => {
      success({
        title: t('bridge.successfullySetAllowance')
      })
    })
    .catch($onError)
    .finally(() => {
      status.setIdle()
    })
}

function handleSetAllowance() {
  peggyStore
    .setTokenAllowance(
      props.balanceWithToken as BalanceWithTokenWithErc20Balance
    )
    .then(() => {
      success({
        title: t('bridge.successfullySetAllowance')
      })
    })
    .catch($onError)
    .finally(() => {
      status.setIdle()
    })
}
</script>

<template>
  <div class="w-full">
    <p class="mb-3 text-xs text-gray-300">
      <span>{{
        $t('bridge.setAllowanceForBridging', {
          asset: formValues[BridgeField.Token]?.symbol || ''
        })
      }}</span>

      <span v-if="hasNonUnlimitedAllowanceSet" class="ml-2 font-semibold">
        {{ $t('bridge.allowance') }}: {{ allowance.toFixed(2) }}
        {{ balanceWithToken?.token.symbol || '' }}
      </span>
    </p>

    <AppButton
      lg
      :status="status"
      class="w-full bg-blue-500 text-blue-900 font-semibold"
      data-cy="allowance-modal-set-button"
      @click="handleClickOnSetAllowance"
    >
      <span>{{ $t('bridge.setAllowance') }}</span>
    </AppButton>

    <p
      v-if="allowance.isZero() || hasNonUnlimitedAllowanceSet"
      class="mt-3 text-xs text-gray-400"
    >
      <span v-if="needsAllowanceReset">{{
        $t('bridge.allowanceNoteReset')
      }}</span>
      <span v-else>{{ $t('bridge.allowanceNote') }}</span>
    </p>
  </div>
</template>
