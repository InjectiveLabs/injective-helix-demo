<script setup lang="ts">
import { LiquidityBotField, UiMarketWithToken } from '@/types'

const props = withDefaults(
  defineProps<{
    market: UiMarketWithToken
  }>(),
  {}
)

const { value: baseAmount } = useStringField({
  name: LiquidityBotField.BaseAmount,
  initialValue: ''
})

const { value: quoteAmount } = useStringField({
  name: LiquidityBotField.QuoteAmount,
  initialValue: ''
})
</script>

<template>
  <div>
    <div class="flex items-center justify-between">
      <p class="text-sm font-semibold">
        {{ $t('liquidityBots.deposit') }}
      </p>
      <p class="text-sm text-coolGray-500 font-semibold">
        {{ $t('liquidityBots.depositDescription') }}
      </p>
    </div>

    <div class="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
      <AppInputField v-model="baseAmount">
        <template #top>
          <div class="flex items-center justify-between pb-2">
            <p class="text-xs text-gray-400">
              {{ $t('liquidityBots.depositAmount') }}
            </p>
            <div class="flex items-center gap-2">
              <UBadge size="xs" variant="subtle">
                {{ $t('common.max') }}
              </UBadge>
              <p class="text-xs text-primary">20.4</p>
            </div>
          </div>
        </template>

        <template #right>
          <div class="flex items-center gap-2">
            <UAvatar
              :src="props.market.baseToken.logo"
              size="2xs"
              :alt="props.market.baseToken.symbol"
            />
            <p>{{ props.market.baseToken.symbol }}</p>
          </div>
        </template>
      </AppInputField>

      <AppInputField v-model="quoteAmount">
        <template #top>
          <div class="flex items-center justify-between pb-2">
            <p class="text-xs text-gray-400">
              {{ $t('liquidityBots.depositAmount') }}
            </p>
            <div class="flex items-center gap-2">
              <UBadge size="xs" variant="subtle">
                {{ $t('common.max') }}
              </UBadge>
              <p class="text-xs text-primary">20.4</p>
            </div>
          </div>
        </template>

        <template #right>
          <div class="flex items-center gap-2">
            <UAvatar
              :src="props.market.quoteToken.logo"
              size="2xs"
              :alt="props.market.quoteToken.symbol"
            />
            <p>{{ props.market.quoteToken.symbol }}</p>
          </div>
        </template>
      </AppInputField>
    </div>

    <div class="mt-4 text-xs text-coolGray-500">
      <p>
        {{
          $t('sgt.minInvestmentDescription', {
            symbols: market.baseToken.symbol,
            amount: 20
          })
        }}
      </p>
      <p>
        {{
          $t('sgt.totalBaseAndQuote', {
            base: props.market.baseToken.symbol,
            quote: props.market.quoteToken.symbol
          })
        }}:100$
      </p>
    </div>
  </div>
</template>
