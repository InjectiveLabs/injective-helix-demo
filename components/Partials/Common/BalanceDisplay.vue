<script lang="ts" setup>
import { usdtToken } from '@shared/data/token'
import { TokenStatic } from '@injectivelabs/sdk-ts'
import { BigNumberInBase } from '@injectivelabs/utils'
import {
  sharedToBalanceInToken,
  sharedStripTrillingZero
} from '@shared/utils/formatter'
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
  sharedStripTrillingZero(
    sharedToBalanceInToken({
      value: accountStore.balancesMap[props.token.denom],
      decimalPlaces: props.token.decimals,
      fixedDecimals: UI_DEFAULT_DISPLAY_DECIMALS
    })
  )
)

const neptuneUsdtBalance = computed(() =>
  sharedStripTrillingZero(
    sharedToBalanceInToken({
      value: new BigNumberInBase(accountStore.neptuneUsdtInBankBalance)
        .times(1 - NEPTUNE_USDT_BUFFER)
        .toFixed(),
      decimalPlaces: props.token.decimals,
      fixedDecimals: UI_DEFAULT_DISPLAY_DECIMALS
    })
  )
)

const isDisabled = computed(
  () => props.isTooltipDisabled || !hasNeptuneUsdtBalance.value
)
</script>

<template>
  <div>
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
        <div>
          <p>
            {{
              $t('trade.neptuneUsdt.availableUsdt', {
                peggyUsdt: peggyUsdtBalance,
                neptuneUsdt: neptuneUsdtBalance
              })
            }}
          </p>
          <p>{{ $t('trade.neptuneUsdt.percentageInReserve') }}</p>
        </div>
      </template>
    </CommonHeaderTooltip>
  </div>
</template>
