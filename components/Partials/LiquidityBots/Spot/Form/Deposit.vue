<script setup lang="ts">
import { BigNumberInBase } from '@injectivelabs/utils'
import { LiquidityBotField } from '@/types'
import type { LiquidityBotForm, UiMarketWithToken } from '@/types'

const sharedTokenStore = useSharedTokenStore()
const sharedWalletStore = useSharedWalletStore()
const formValues = useFormValues<LiquidityBotForm>()
const { subaccountPortfolioBalanceMap } = useBalance()

const props = withDefaults(
  defineProps<{
    isSingleColumn?: boolean
    market: UiMarketWithToken
  }>(),
  {}
)

const accountBalance = computed(
  () =>
    subaccountPortfolioBalanceMap.value[
      sharedWalletStore.authZOrDefaultSubaccountId
    ]
)

const baseBalance = computed(() =>
  sharedToBalanceInToken({
    value:
      accountBalance.value?.find(
        (balance) => balance.denom === props.market.baseToken.denom
      )?.availableBalance || '0',
    decimalPlaces: props.market.baseToken.decimals
  })
)

const quoteBalance = computed(() =>
  sharedToBalanceInToken({
    value:
      accountBalance.value?.find(
        (balance) => balance.denom === props.market.quoteToken.denom
      )?.availableBalance || '0',
    decimalPlaces: props.market.quoteToken.decimals
  })
)

const totalAmountInUsd = computed(() => {
  const baseAmountInBigNumber = new BigNumberInBase(
    formValues.value[LiquidityBotField.BaseAmount] || '0'
  )
  const quoteAmountInBigNumber = new BigNumberInBase(
    formValues.value[LiquidityBotField.QuoteAmount] || '0'
  )

  const baseInUsd = baseAmountInBigNumber.times(
    sharedTokenStore.tokenUsdPrice(props.market.baseToken)
  )

  const quoteInUsd = quoteAmountInBigNumber.times(
    sharedTokenStore.tokenUsdPrice(props.market.quoteToken)
  )

  return baseInUsd.plus(quoteInUsd).toString()
})

const { value: baseAmount, errorMessage: baseErrorMessage } = useStringField({
  name: LiquidityBotField.BaseAmount,
  initialValue: '',
  rule: '',
  dynamicRule: computed(() => {
    const requiredIfFieldEmptyRule = `requiredIfEmpty:@${LiquidityBotField.QuoteAmount}`

    const minTotalAmountUsdSgtRule = `minTotalAmountUsdSgt:${totalAmountInUsd.value}`

    const insufficientBalanceRule = `insufficientBalance:${baseBalance.value}`

    return [
      requiredIfFieldEmptyRule,
      minTotalAmountUsdSgtRule,
      insufficientBalanceRule
    ].join('|')
  })
})

const { value: quoteAmount, errorMessage: quoteErrorMessage } = useStringField({
  name: LiquidityBotField.QuoteAmount,
  initialValue: '',
  rule: '',
  dynamicRule: computed(() => {
    const requiredIfFieldEmptyRule = `requiredIfEmpty:@${LiquidityBotField.BaseAmount}`

    const minTotalAmountUsdSgtRule = `minTotalAmountUsdSgt:${totalAmountInUsd.value}`

    const insufficientBalanceRule = `insufficientBalance:${quoteBalance.value}`

    return [
      requiredIfFieldEmptyRule,
      minTotalAmountUsdSgtRule,
      insufficientBalanceRule
    ].join('|')
  })
})

function setBaseMax() {
  baseAmount.value = baseBalance.value
}

function setQuoteMax() {
  quoteAmount.value = quoteBalance.value
}
</script>

<template>
  <div>
    <div class="sm:flex items-center justify-between">
      <p class="text-sm font-semibold">
        {{ $t('tradingBots.liquidityBots.deposit') }}
      </p>
      <p class="text-sm text-coolGray-500 font-semibold">
        {{ $t('tradingBots.liquidityBots.depositDescription') }}
      </p>
    </div>

    <div
      class="mt-4 grid grid-cols-1 gap-4"
      :class="{ 'sm:grid-cols-2': !isSingleColumn }"
    >
      <div>
        <AppInputField v-model="baseAmount">
          <template #top>
            <div class="flex items-center justify-between pb-2">
              <p class="text-xs text-gray-400">
                {{ $t('tradingBots.liquidityBots.depositAmount') }}
              </p>
              <div class="flex items-center gap-2">
                <div
                  class="border border-blue-500 hover:bg-blue-500/30 hover:cursor-pointer rounded text-blue-500 px-1 text-[9px] font-bold leading-none py-1"
                  @click="setBaseMax"
                >
                  {{ $t('common.max') }}
                </div>
                <div class="text-xs text-primary">
                  <SharedAmount
                    v-bind="{
                      useSubscript: true,
                      amount: baseBalance,
                      shouldAbbreviate: false
                    }"
                  />
                </div>
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

        <p v-if="baseErrorMessage" class="error-message mt-2 capitalize">
          {{ baseErrorMessage }}
        </p>
      </div>

      <div>
        <AppInputField v-model="quoteAmount">
          <template #top>
            <div class="flex items-center justify-between pb-2">
              <p class="text-xs text-gray-400">
                {{ $t('tradingBots.liquidityBots.depositAmount') }}
              </p>
              <div class="flex items-center gap-2">
                <div
                  class="border border-blue-500 hover:bg-blue-500/30 hover:cursor-pointer rounded text-blue-500 px-1 text-[9px] font-bold leading-none py-1"
                  @click="setQuoteMax"
                >
                  {{ $t('common.max') }}
                </div>
                <div class="text-xs text-primary">
                  <SharedAmount
                    v-bind="{
                      useSubscript: true,
                      amount: quoteBalance,
                      shouldAbbreviate: false
                    }"
                  />
                </div>
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

        <p v-if="quoteErrorMessage" class="error-message mt-2 capitalize">
          {{ quoteErrorMessage }}
        </p>
      </div>
    </div>
  </div>
</template>
