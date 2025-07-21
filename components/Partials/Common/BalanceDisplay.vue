<script lang="ts" setup>
import { usdtToken } from '@shared/data/token'
import { BigNumberInBase } from '@injectivelabs/utils'
import { DEFAULT_ASSET_DECIMALS } from '@shared/utils/constant'
import {
  sharedToBalanceInToken,
  sharedStripTrillingZero
} from '@shared/utils/formatter'
import { NEPTUNE_USDT_BUFFER } from '@/app/utils/constants'
import type { TokenStatic } from '@injectivelabs/sdk-ts'

const accountStore = useAccountStore()

const props = withDefaults(
  defineProps<{
    token: TokenStatic
    value: string | number
    isAlignRight?: boolean
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
      fixedDecimals: DEFAULT_ASSET_DECIMALS
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
      fixedDecimals: DEFAULT_ASSET_DECIMALS
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
        classes: isDisabled ? 'cursor-text' : '',
        ui: {
          width: 'max-w-96',
          trigger: isAlignRight ? '' : 'inline-flex w-full'
        }
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
