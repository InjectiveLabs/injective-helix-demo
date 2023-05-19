<script setup lang="ts">
import {
  BalanceWithTokenWithErc20Balance,
  BridgingNetwork,
  ZERO_IN_BASE
} from '@injectivelabs/sdk-ui-ts'
import { BigNumberInBase, BigNumberInWei } from '@injectivelabs/utils'
import { BridgeField, BridgeForm, BridgeType } from '@/types'

const peggyStore = usePeggyStore()

const formValues = useFormValues<BridgeForm>() as Ref<BridgeForm>

const { balanceWithToken } = useBridgeBalance(formValues)

const allowance = computed(() => {
  if (!balanceWithToken.value) {
    return ZERO_IN_BASE
  }

  if (formValues.value[BridgeField.BridgeType] === BridgeType.Withdraw) {
    return ZERO_IN_BASE
  }

  if (
    formValues.value[BridgeField.BridgingNetwork] !== BridgingNetwork.Ethereum
  ) {
    return ZERO_IN_BASE
  }

  const balanceWithTokenWithErc20Balance =
    balanceWithToken.value as BalanceWithTokenWithErc20Balance

  return new BigNumberInWei(
    balanceWithTokenWithErc20Balance.erc20Balance?.allowance || 0
  ).toBase(balanceWithTokenWithErc20Balance.token.decimals)
})

const needsAllowanceSet = computed(() => {
  if (formValues.value[BridgeField.BridgeType] === BridgeType.Withdraw) {
    return false
  }

  if (
    formValues.value[BridgeField.BridgingNetwork] !== BridgingNetwork.Ethereum
  ) {
    return false
  }

  const balance = new BigNumberInBase(balanceWithToken.value?.balance || '')

  return (
    allowance.value.lt(formValues.value[BridgeField.Amount]) && balance.gt(0)
  )
})

onMounted(() => {
  peggyStore.getErc20BalancesWithTokenAndPrice()
  peggyStore.getErc20DenomBalanceAndAllowance(
    formValues.value[BridgeField.Denom]
  )
})
</script>

<template>
  <div>
    <CommonAllowance
      v-if="needsAllowanceSet && balanceWithToken"
      v-bind="{
          allowance,
          balanceWithToken: balanceWithToken as BalanceWithTokenWithErc20Balance
        }"
    />

    <div v-else>
      <slot></slot>
    </div>
  </div>
</template>
