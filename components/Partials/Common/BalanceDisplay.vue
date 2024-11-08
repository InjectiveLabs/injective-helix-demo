<script lang="ts" setup>
import { TokenStatic } from '@injectivelabs/sdk-ts'
import { BigNumberInBase } from '@injectivelabs/utils'
import { usdtToken } from '@shared/data/token'
import { toBalanceInToken } from '@/app/utils/formatters'
import {
  NEPTUNE_USDT_BUFFER,
  UI_DEFAULT_DISPLAY_DECIMALS
} from '@/app/utils/constants'

const accountStore = useAccountStore()

const props = withDefaults(
  defineProps<{
    token: TokenStatic
    value: string | number
    isTooltipDisabled?: boolean
  }>(),
  {}
)

const isUsdtToken = computed(() => props.token.denom === usdtToken.denom)

const hasNeptuneUsdtBalance = computed(
  () =>
    isUsdtToken.value &&
    accountStore.isDefaultSubaccount &&
    new BigNumberInBase(accountStore.neptuneUsdtInBankBalance).gt(0)
)

const peggyUsdtBalance = computed(() =>
  toBalanceInToken({
    value: accountStore.balancesMap[props.token.denom],
    decimalPlaces: props.token.decimals,
    fixedDecimals: UI_DEFAULT_DISPLAY_DECIMALS
  })
)

const neptuneUsdtBalance = computed(() =>
  toBalanceInToken({
    value: new BigNumberInBase(accountStore.neptuneUsdtInBankBalance)
      .times(1 - NEPTUNE_USDT_BUFFER)
      .toFixed(),
    decimalPlaces: props.token.decimals,
    fixedDecimals: UI_DEFAULT_DISPLAY_DECIMALS
  })
)

const isDisabled = computed(
  () => props.isTooltipDisabled || !hasNeptuneUsdtBalance.value
)
</script>

<template>
  <CommonHeaderTooltip
    v-bind="{
      ...$attrs,
      isDisabled,
      isNotStyled: isDisabled,
      classes: isDisabled ? 'cursor-text' : ''
    }"
  >
    <slot>
      <span>{{ value }}</span>
    </slot>
    <template #customTooltip>
      <span>
        {{
          $t('trade.neptuneUsdt.availableUsdt', {
            peggyUsdt: peggyUsdtBalance,
            neptuneUsdt: neptuneUsdtBalance
          })
        }}
      </span>
    </template>
  </CommonHeaderTooltip>
</template>
