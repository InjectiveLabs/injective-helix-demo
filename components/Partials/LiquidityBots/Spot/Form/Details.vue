<script setup lang="ts">
import { BigNumberInBase } from '@injectivelabs/utils'
import { volatilityStrategyBounds } from '@/app/data/grid-strategy'
import { LiquidityBotField } from '@/types'
import type { Status } from '@injectivelabs/utils'
import type {
  LiquidityValues,
  LiquidityBotForm,
  VolatilityStrategyType
} from '@/types'

defineProps<{
  status: Status
  liquidityValues: LiquidityValues
  lastTradedPrice: BigNumberInBase
}>()

const formValues = useFormValues<LiquidityBotForm>()

const trailingBounds = computed(() => {
  return new BigNumberInBase(
    volatilityStrategyBounds[
      formValues.value[LiquidityBotField.Volatility] as VolatilityStrategyType
    ].trailingBounds
  )
    .times(100)
    .toFixed()
})
</script>

<template>
  <div>
    <UAccordion
      variant="ghost"
      color="gray"
      default-open
      :items="[
        {
          label: 'Details',
          slot: 'details'
        }
      ]"
    >
      <template #details>
        <div class="text-white space-y-2">
          <div class="flex justify-between items-center">
            <p class="text-xs text-coolGray-500">
              {{ $t('tradingBots.numberOfGrids') }}
            </p>

            <USkeleton v-if="status.isLoading()" class="w-16 h-5" />

            <div v-else class="font-semibold">
              {{ liquidityValues.grids }}
            </div>
          </div>

          <div class="flex justify-between items-center">
            <p class="text-xs text-coolGray-500">
              {{ $t('tradingBots.lowerPrice') }}
            </p>
            <div class="font-semibold">
              <USkeleton v-if="status.isLoading()" class="w-16 h-5" />

              <SharedAmount
                v-else
                v-bind="{
                  useSubscript: true,
                  shouldAbbreviate: false,
                  amount: liquidityValues.lowerBound.toFixed()
                }"
              />
            </div>
          </div>

          <div class="flex justify-between items-center">
            <p class="text-xs text-coolGray-500">
              {{ $t('tradingBots.upperPrice') }}
            </p>
            <div class="font-semibold">
              <USkeleton v-if="status.isLoading()" class="w-16 h-5" />

              <SharedAmount
                v-else
                v-bind="{
                  useSubscript: true,
                  shouldAbbreviate: false,
                  amount: liquidityValues.upperBound.toFixed()
                }"
              />
            </div>
          </div>

          <div class="flex justify-between items-center max-sm:hidden">
            <p class="text-xs text-coolGray-500">
              {{ $t('tradingBots.liquidityBots.trailingBoundaries') }}
            </p>
            <USkeleton v-if="status.isLoading()" class="w-16 h-5" />

            <div v-else class="font-semibold flex items-center gap-1">
              ±
              {{ trailingBounds }}% /
              <SharedAmount
                v-bind="{
                  useSubscript: true,
                  shouldAbbreviate: false,
                  amount: liquidityValues.trailingUpperBound.toFixed()
                }"
              />
              -
              <SharedAmount
                v-bind="{
                  useSubscript: true,
                  shouldAbbreviate: false,
                  amount: liquidityValues.trailingLowerBound.toFixed()
                }"
              />
            </div>
          </div>

          <div class="flex justify-between items-center sm:hidden">
            <p class="text-xs text-coolGray-500">
              {{ $t('tradingBots.liquidityBots.trailingBoundaries') }}
            </p>
            <USkeleton v-if="status.isLoading()" class="w-16 h-5" />

            <div v-else class="font-semibold flex items-center gap-1">
              ± {{ trailingBounds }}%
            </div>
          </div>

          <div class="flex justify-between items-center sm:hidden">
            <p class="text-xs text-coolGray-500">
              {{ $t('tradingBots.liquidityBots.trailingUpper') }}
            </p>
            <USkeleton v-if="status.isLoading()" class="w-16 h-5" />

            <div v-else class="font-semibold flex items-center gap-1">
              <SharedAmount
                v-bind="{
                  useSubscript: true,
                  shouldAbbreviate: false,
                  amount: liquidityValues.trailingUpperBound.toFixed()
                }"
              />
            </div>
          </div>

          <div class="flex justify-between items-center sm:hidden">
            <p class="text-xs text-coolGray-500">
              {{ $t('tradingBots.liquidityBots.trailingLower') }}
            </p>
            <USkeleton v-if="status.isLoading()" class="w-16 h-5" />

            <div v-else class="font-semibold flex items-center gap-1">
              <SharedAmount
                v-bind="{
                  useSubscript: true,
                  shouldAbbreviate: false,
                  amount: liquidityValues.trailingLowerBound.toFixed()
                }"
              />
            </div>
          </div>

          <div class="flex justify-between items-center">
            <p class="text-xs text-coolGray-500">
              {{ $t('tradingBots.currentPrice') }}
            </p>
            <div class="font-semibold">
              <USkeleton v-if="status.isLoading()" class="w-16 h-5" />

              <SharedAmount
                v-else
                v-bind="{
                  useSubscript: true,
                  shouldAbbreviate: false,
                  amount: lastTradedPrice.toFixed()
                }"
              />
            </div>
          </div>

          <!-- TODO: Add stop loss and take profit -->

          <!-- <div class="flex justify-between items-center">
            <p class="text-xs text-coolGray-500">
              {{ $t('trade.stopLoss') }}
            </p>
            <p class="font-semibold">ToDo</p>
          </div>

          <div class="flex justify-between items-center">
            <p class="text-xs text-coolGray-500">
              {{ $t('trade.takeProfit') }}
            </p>
            <p class="font-semibold">ToDo</p>
          </div> -->
        </div>
      </template>
    </UAccordion>
  </div>
</template>
