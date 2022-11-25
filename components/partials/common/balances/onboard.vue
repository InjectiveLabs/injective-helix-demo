<template>
  <div>
    <VButton md primary class="w-full rounded" @click="handleClickOnButton">
      <span v-if="activeStep === 1" data-cy="onboarding-banner-deposit-button">
        {{ $t('common.deposit') }}
      </span>
      <span
        v-else-if="activeStep === 2"
        data-cy="onboarding-banner-transfer-button"
      >
        {{ $t('marketPage.transferToTrade') }}
      </span>
      <span v-else data-cy="onboarding-banner-trade-button">{{
        $t('common.trade')
      }}</span>
    </VButton>
    <div class="mt-6">
      <ProgressSteps
        data-cy="onboarding-banner-progress-steps"
        :steps="2"
        :active-step="activeStep"
        :steps-labels="[$t('common.deposit'), $t('common.transfer')]"
        :steps-notes="[
          $t('marketPage.noChainBalanceNote'),
          $t('marketPage.noTradingAccountBalance')
        ]"
      />
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { Wallet, isCosmosWallet } from '@injectivelabs/wallet-ts'
import { BigNumberInBase, BigNumberInWei } from '@injectivelabs/utils'
import { INJ_DENOM } from '@injectivelabs/sdk-ts'
import {
  BankBalances,
  UiDerivativeMarketWithToken,
  UiSpotMarketWithToken,
  ZERO_IN_BASE
} from '@injectivelabs/sdk-ui-ts'
import { CurrentMarket, Modal } from '~/types'
import { injToken } from '~/app/data/token'
import { INJ_GAS_BUFFER } from '~/app/utils/constants'

export default Vue.extend({
  computed: {
    wallet(): Wallet {
      return this.$accessor.wallet.wallet
    },

    bankBalances(): BankBalances {
      return this.$accessor.bank.balances
    },

    currentSpotMarket(): UiSpotMarketWithToken | undefined {
      return this.$accessor.spot.market
    },

    currentDerivativeMarket(): UiDerivativeMarketWithToken | undefined {
      return this.$accessor.derivatives.market
    },

    currentMarket(): CurrentMarket {
      const { currentSpotMarket, currentDerivativeMarket } = this

      return this.$route.name === 'spot-spot'
        ? currentSpotMarket
        : currentDerivativeMarket
    },

    hasAnyBankBalances(): boolean {
      return this.$accessor.bank.hasAnyBankBalance
    },

    activeStep(): number {
      if (!this.hasAnyBankBalances) {
        return 1
      }

      return 2
    },

    isWalletExemptFromGasFee(): boolean {
      const { wallet } = this

      return !isCosmosWallet(wallet)
    },

    balance(): BigNumberInBase {
      const { bankBalances } = this

      const balance = bankBalances[injToken.denom || INJ_DENOM]

      if (!balance) {
        return ZERO_IN_BASE
      }

      return new BigNumberInWei(balance).toBase(injToken.decimals)
    },

    hasSufficientBalance(): boolean {
      const { balance } = this

      return balance.gt(new BigNumberInBase(INJ_GAS_BUFFER))
    }
  },

  methods: {
    handleClickOnButton() {
      const { isWalletExemptFromGasFee, hasSufficientBalance, currentMarket } =
        this

      if (!isWalletExemptFromGasFee && !hasSufficientBalance) {
        this.$accessor.modal.openModal({ type: Modal.InsufficientInjForGas })
        return
      }

      if (!currentMarket) {
        return
      }

      this.$accessor.modal.openModal({
        type: Modal.Bridge,
        data: {
          denom: currentMarket.quoteDenom
        }
      })
    }
  }
})
</script>
