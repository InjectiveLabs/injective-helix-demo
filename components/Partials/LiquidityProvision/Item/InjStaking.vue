<script setup lang="ts">
import { injToken } from '@shared/data/token'
import { getHubUrl } from '@shared/utils/network'
import { BigNumberInBase } from '@injectivelabs/utils'
import { UI_DEFAULT_MIN_DISPLAY_DECIMALS } from '@/app/utils/constants'
import { LiquidityProvisionType } from '@/types'

const tokenStore = useTokenStore()
const liquidityProvisionStore = useLiquidityProvisionStore()

const stakingUrl = `${getHubUrl()}/staking`

const token = computed(() => tokenStore.tokenByDenomOrSymbol(injToken.denom))

const apr = computed(() =>
  new BigNumberInBase(liquidityProvisionStore.apr)
    .multipliedBy(100)
    .toFormat(UI_DEFAULT_MIN_DISPLAY_DECIMALS)
)
</script>

<template>
  <PartialsLiquidityProvisionItem
    v-if="token"
    v-bind="{
      url: stakingUrl,
      title: $t(
        `liquidityProvision.type.${LiquidityProvisionType.InjectiveStaking}`
      )
    }"
  >
    <template #default>
      <CommonTokenIcon is-lg v-bind="{ token }" />
    </template>

    <template #content>
      <div class="min-w-0 truncate">
        <p>{{ $t('campaign.apy') }}</p>
        <p class="text-xl font-semibold text-green-500">
          <span>{{ apr }}%</span>
        </p>
      </div>
    </template>
  </PartialsLiquidityProvisionItem>
</template>
