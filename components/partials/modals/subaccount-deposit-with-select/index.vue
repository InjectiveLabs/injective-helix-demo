<template>
  <v-modal :is-open="isModalOpen" @modal-closed="closeModal">
    <h3 slot="title">
      {{ $t('Deposit to Subaccount') }}
    </h3>

    <div class="relative">
      <HOCLoading :status="status">
        <div class="flex flex-wrap">
          <p class="text-sm text-gray-300 text-center">
            {{ $t('subaccount_deposit_modal_note') }}
          </p>
          <div class="w-full mt-4 pt-4 border-t">
            <v-bank-balance :balance="balance" :token="token">
              <div class="w-full">
                <v-select-custom
                  v-model="tokenDenom"
                  :options="
                    supply.map((a) => ({
                      code: a.denom,
                      label: a.token.symbol.toUpperCase()
                    }))
                  "
                  :label="$t('asset')"
                  :placeholder="$t('Asset Transfer Tooltip')"
                >
                </v-select-custom>
              </div>
            </v-bank-balance>
          </div>
        </div>
      </HOCLoading>
    </div>
  </v-modal>
</template>

<script lang="ts">
import Vue from 'vue'
import {
  BigNumberInBase,
  BigNumberInWei,
  Status,
  StatusType
} from '@injectivelabs/utils'
import {
  UiDerivativeMarketWithToken,
  UiSpotMarketWithToken,
  BankBalances,
  BankBalanceWithToken,
  Token,
  ZERO_IN_BASE
} from '@injectivelabs/ui-common'
import VBankBalance from './bank-balance.vue'
import HOCLoading from '~/components/hoc/loading.vue'
import VSelectCustom from '~/components/inputs/select-custom.vue'
import { Modal } from '~/types'

export default Vue.extend({
  components: {
    VBankBalance,
    HOCLoading,
    VSelectCustom
  },

  data() {
    return {
      tokenDenom: '' as string,
      status: new Status(StatusType.Loading)
    }
  },

  computed: {
    derivativeMarkets(): UiDerivativeMarketWithToken[] {
      return this.$accessor.derivatives.markets
    },

    spotMarkets(): UiSpotMarketWithToken[] {
      return this.$accessor.spot.markets
    },

    tradeableDenoms(): string[] {
      const { derivativeMarkets, spotMarkets } = this

      const derivativeQuoteDenoms = derivativeMarkets.map((a) => a.quoteDenom)
      const spotBaseDenoms = spotMarkets.map((a) => a.baseDenom)
      const spotQuoteDenoms = spotMarkets.map((a) => a.quoteDenom)

      return [...derivativeQuoteDenoms, ...spotBaseDenoms, ...spotQuoteDenoms]
    },

    bankBalances(): BankBalances {
      return this.$accessor.bank.balances
    },

    ibcBalances(): BankBalances {
      return this.$accessor.bank.ibcBalances
    },

    bankBalancesWithToken(): BankBalanceWithToken[] {
      return this.$accessor.bank.bankErc20BalancesWithToken
    },

    ibcBankBalancesWithToken(): BankBalanceWithToken[] {
      return this.$accessor.bank.bankIbcBalancesWithToken
    },

    supply(): BankBalanceWithToken[] {
      const {
        bankBalancesWithToken,
        ibcBankBalancesWithToken,
        tradeableDenoms
      } = this
      const supply = [...bankBalancesWithToken, ...ibcBankBalancesWithToken]

      return supply.reduce((bankBalances, bankBalance) => {
        if (tradeableDenoms.includes(bankBalance.denom)) {
          return [...bankBalances, bankBalance]
        }

        return bankBalances
      }, [] as BankBalanceWithToken[])
    },

    token(): Token | undefined {
      const { supply, tokenDenom } = this

      const supplyToken = supply.find((token) => token.denom === tokenDenom)

      if (!supplyToken) {
        return undefined
      }

      return supplyToken.token
    },

    balances(): BankBalances {
      const { bankBalances, ibcBalances } = this

      return { ...bankBalances, ...ibcBalances }
    },

    balance(): BigNumberInBase {
      const { balances, token } = this

      if (!token) {
        return ZERO_IN_BASE
      }

      if (!balances[token.denom]) {
        return ZERO_IN_BASE
      }

      return new BigNumberInWei(balances[token.denom] || 0).toBase(
        token.decimals
      )
    },

    isModalOpen(): boolean {
      return this.$accessor.modal.modals[Modal.SubaccountDepositWithSelect]
    }
  },

  mounted() {
    Promise.all([this.$accessor.bank.fetchBankBalancesWithToken()])
      .then(() => {
        //
      })
      .catch(this.$onError)
      .finally(() => {
        this.status.setIdle()
      })
  },

  methods: {
    closeModal() {
      this.$accessor.modal.closeModal(Modal.SubaccountDepositWithSelect)
    }
  }
})
</script>
