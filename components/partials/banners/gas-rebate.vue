<template>
  <VCard v-if="!hasTrades && status.isIdle()" md>
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
      <div class="flex justify-between">
        <div>
          <span
            class="text-primary-500 text-2xs px-1 py-0.4 bg-primary-500 bg-opacity-10 rounded align-top"
          >
            {{ $t('banners.newUser.subtitle') }}
          </span>
          <p class="font-bold text-lg mb-4">
            {{ $t('banners.newUser.title') }}
          </p>
          <p class="text-sm text-gray-500 max-w-2xs">
            {{ $t('banners.newUser.description') }}
          </p>
        </div>

        <img
          src="/svg/astro-1.svg"
          alt="Injective Rewards"
          class="w-24 h-24 lg:w-28 lg:h-28 lg:mr-5 ml-3 self-center xl:self-end"
        />
      </div>

      <div class="hidden lg:block col-span-2">
        <ProgressSteps :steps="3" :active-step="activeStep" />
        <div class="grid grid-cols-3 mt-3 gap-8 xl:gap-12 2xl:gap-16">
          <div>
            <span class="tracking-wider uppercase text-xs">
              {{ $t('banners.newUser.stepOne') }}
            </span>
            <p class="mt-2 text-sm font-semibold">
              {{ $t('banners.newUser.stepOneDescription') }}
            </p>
          </div>
          <div>
            <span class="tracking-wider uppercase text-xs">
              {{ $t('banners.newUser.stepTwo') }}
            </span>
            <p class="mt-2 text-sm font-semibold">
              {{ $t('banners.newUser.stepTwoDescription') }}
            </p>
          </div>
          <div>
            <span class="tracking-wider uppercase text-xs">
              {{ $t('banners.newUser.stepThree') }}
            </span>
            <VButton
              lg
              primary
              :status="status"
              :disabled="activeStep !== 3"
              class="block w-56 mt-3"
              @click.native="handleClickOnRedeem"
            >
              <span class="font-bold" data-cy="new-user-banner-claim-button">
                {{ $t('banners.newUser.claimRebate') }}
              </span>
            </VButton>
          </div>
        </div>
      </div>

      <div class="lg:hidden sm:max-w-xs sm:mx-auto h-full mt-8 sm:mt-0">
        <p class="text-xs tracking-wide uppercase mb-4">
          {{ $t('banners.newUser.stepList', { step: mobileStep }) }}
        </p>
        <transition
          mode="out-in"
          :name="slideLeft ? 'fade-left' : 'fade-right'"
        >
          <p
            v-if="mobileStep === 1"
            key="newUserMobileOne"
            class="text-sm font-semibold max-w-xs"
          >
            {{ $t('banners.newUser.stepOneDescription') }}
          </p>
          <p
            v-else-if="mobileStep === 2"
            key="newUserMobileTwo"
            class="text-sm font-semibold max-w-xs"
          >
            {{ $t('banners.newUser.stepTwoDescription') }}
          </p>
          <p
            v-else
            key="newUserMobileThree"
            class="text-sm font-semibold max-w-xs"
          >
            <VButton lg primary class="block w-80" :disabled="activeStep !== 3">
              <span class="font-bold">
                {{ $t('banners.newUser.claimRebate') }}
              </span>
            </VButton>
          </p>
        </transition>

        <v-bar-steps
          class="mt-4 max-w-xs mx-auto"
          :steps="3"
          :active-step="mobileStep"
          @change="handleMobileStepChange"
        />
      </div>
    </div>
  </VCard>
</template>

<script lang="ts">
import { UserDeposit } from '@injectivelabs/sdk-ts'
import {
  BankBalanceWithToken,
  SubaccountBalanceWithToken,
  UiDerivativeMarketWithToken,
  UiDerivativeTrade,
  UiSpotMarketWithToken,
  UiSpotTrade,
  ZERO_IN_BASE
} from '@injectivelabs/sdk-ui-ts'
import { Token } from '@injectivelabs/token-metadata'
import {
  BigNumberInBase,
  BigNumberInWei,
  Status,
  StatusType
} from '@injectivelabs/utils'
import Vue from 'vue'
import {
  MIN_AMOUNT_REQUIRED_FOR_GAS_REBATE,
  MIN_TIMESTAMP_REQUIRED_FOR_GAS_REBATE
} from '~/app/utils/constants'

export default Vue.extend({
  data() {
    return {
      status: new Status(StatusType.Loading),

      mobileStep: 1,
      slideLeft: false
    }
  },

  computed: {
    deposits(): UserDeposit[] {
      return this.$accessor.gasRebate.deposits
    },

    derivativeMarkets(): UiDerivativeMarketWithToken[] {
      return this.$accessor.derivatives.markets
    },

    spotMarkets(): UiSpotMarketWithToken[] {
      return this.$accessor.spot.markets
    },

    trades(): Array<UiSpotTrade | UiDerivativeTrade> {
      return this.$accessor.gasRebate.trades
    },

    bankBalancesWithToken(): BankBalanceWithToken[] {
      return this.$accessor.bank.bankBalancesWithToken
    },

    subaccountBalanceWithToken(): SubaccountBalanceWithToken[] {
      return this.$accessor.account.subaccountBalancesWithToken
    },

    bankUsdtBalance(): BankBalanceWithToken | undefined {
      const { bankBalancesWithToken } = this

      return bankBalancesWithToken.find(
        (bankBalance: BankBalanceWithToken) =>
          bankBalance.token.symbol.toUpperCase() === 'USDT'
      )
    },

    subaccountUsdtBalance(): SubaccountBalanceWithToken | undefined {
      const { subaccountBalanceWithToken } = this

      return subaccountBalanceWithToken.find(
        (balance: SubaccountBalanceWithToken) =>
          balance.token.symbol.toUpperCase() === 'USDT'
      )
    },

    hasUsdtBalance(): boolean {
      const { bankUsdtBalance, subaccountUsdtBalance } = this

      return (
        bankUsdtBalance !== undefined || subaccountUsdtBalance !== undefined
      )
    },

    hasTrades(): boolean {
      const { trades } = this

      return trades.length > 0
    },

    hasTradeWithMinimumNotionalUsdt(): boolean {
      const { derivativeMarkets, spotMarkets, trades } = this

      let sum = ZERO_IN_BASE

      for (const trade of trades) {
        const isSpotMarket = spotMarkets
          .map((market) => market.marketId)
          .includes(trade.marketId)
        const markets = [...derivativeMarkets, ...spotMarkets]
        const market = markets.find(
          (market) => market.marketId === trade.marketId
        )

        if (!market) {
          continue
        }

        if (sum.gte(MIN_AMOUNT_REQUIRED_FOR_GAS_REBATE)) {
          break
        }

        if (isSpotMarket) {
          const spotMarket = market as UiSpotMarketWithToken
          const spotTrade = trade as UiSpotTrade
          const price = new BigNumberInBase(
            new BigNumberInBase(spotTrade.price).toWei(
              spotMarket.baseToken.decimals - spotMarket.quoteToken.decimals
            )
          )
          const quantity = new BigNumberInWei(spotTrade.quantity).toBase(
            spotMarket.baseToken.decimals
          )

          sum = sum.plus(price.times(quantity))
        } else {
          const derivativeMarket = market as UiDerivativeMarketWithToken
          const derivativeTrade = trade as UiDerivativeTrade
          const margin = new BigNumberInWei(
            derivativeTrade.executionMargin
          ).toBase(derivativeMarket.quoteToken.decimals)

          sum = sum.plus(margin)
        }
      }

      return sum.gte(MIN_AMOUNT_REQUIRED_FOR_GAS_REBATE)
    },

    hasDepositedMoreThanMinimalUsdt(): boolean {
      const {
        deposits,
        bankUsdtBalance,
        subaccountUsdtBalance,
        hasUsdtBalance
      } = this

      if (!hasUsdtBalance) {
        return false
      }

      const tokenWithBalance = (bankUsdtBalance ||
        subaccountUsdtBalance) as unknown as { token: Token }
      const usdtToken = tokenWithBalance.token
      const usdtAddress = usdtToken.address.replace('peggy', '').toLowerCase()

      const deposit = deposits.find((deposit) => {
        const addressCondition =
          deposit.tokenContract.toLowerCase() === usdtAddress.toLowerCase()
        const amountCondition = new BigNumberInWei(deposit.amount)
          .toBase(usdtToken.decimals)
          .gte(MIN_AMOUNT_REQUIRED_FOR_GAS_REBATE)
        const timestampCondition =
          deposit.timestamp >= MIN_TIMESTAMP_REQUIRED_FOR_GAS_REBATE

        return addressCondition && amountCondition && timestampCondition
      })

      return deposit !== undefined
    },

    activeStep(): number {
      const {
        hasUsdtBalance,
        hasTrades,
        hasTradeWithMinimumNotionalUsdt,
        hasDepositedMoreThanMinimalUsdt
      } = this

      if (!hasUsdtBalance) {
        return 1
      }

      if (!hasDepositedMoreThanMinimalUsdt) {
        return 1
      }

      if (!hasTrades) {
        return 2
      }

      if (!hasTradeWithMinimumNotionalUsdt) {
        return 2
      }

      return 3
    }
  },

  mounted() {
    Promise.all([this.$accessor.gasRebate.init()])
      .then(() => {})
      .catch(this.$onError)
      .finally(() => {
        this.status.setIdle()
      })
  },

  methods: {
    handleMobileStepChange(step: number) {
      this.slideLeft = step < this.mobileStep
      this.mobileStep = step
    },

    handleClickOnRedeem() {
      this.status.setLoading()

      this.$accessor.gasRebate
        .redeem()
        .then(() => {
          this.$toast.success(this.$t('banners.newUser.redeemSuccess'))
        })
        .catch(this.$onRejected)
        .finally(() => {
          this.status.setIdle()
        })
    }
  }
})
</script>
