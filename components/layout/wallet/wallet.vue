<template>
  <div class="flex items-center">
    <div class="flex items-center">
      <div
        id="wallet-address"
        class="font-mono text-sm cursor-pointer flex items-center p-2 rounded-lg"
        data-cy="wallet-connected-popover"
        :class="{
          'text-primary-500 bg-gray-800': isWalletDropdownOpen,
          'text-gray-300': !isWalletDropdownOpen
        }"
        @mouseenter="handleShowDropdown"
        @mouseleave="handleHideDropdown"
        @focus="handleShowDropdown"
        @blur="handleHideDropdown"
      >
        <IconUser class="w-4 h-4 mr-2" />
        <span class="">
          {{ formattedInjectiveAddress }}
        </span>
      </div>
    </div>

    <VPopperBox
      ref="popper-wallet"
      class="popper bg-gray-800 rounded flex flex-col flex-wrap absolute min-w-[356px] z-10 shadow-md"
      binding-element="#wallet-address"
      data-cy="wallet-connected-popper"
      :options="popperOption"
    >
      <div>
        <div class="flex items-center justify-between px-6 py-4">
          <h3 class="text-sm tracking-wider uppercase">
            {{ $t('navigation.myAccount') }}
          </h3>
          <span
            class="text-sm text-primary-500 cursor-pointer"
            data-cy="wallet-connected-popper-disconnect-button"
            @click="handleClickOnLogout"
            >{{ $t('navigation.disconnect') }}
          </span>
        </div>
        <div class="mt-2 flex items-center px-6">
          <LogoMini class="w-12 h-12 mr-4" />
          <div class="flex-1 flex-wrap">
            <div class="flex items-center justify-between w-full">
              <div>
                <span
                  class="font-mono w-full block"
                  data-cy="wallet-connected-popper-inj-address-text-content"
                >
                  {{ formattedInjectiveAddress }}
                </span>
              </div>
              <div class="flex">
                <button
                  v-clipboard="() => injectiveAddress"
                  v-clipboard:success="
                    () => $toast.success($t('connect.copiedAddress'))
                  "
                  role="button"
                  type="button"
                  data-cy="wallet-connected-popper-inj-address-copy-button"
                >
                  <IconCopy
                    class="w-5 h-5 text-gray-500 hover:text-primary-500"
                  />
                </button>
              </div>
            </div>
            <span
              class="w-full flex items-center justify-between mt-2 cursor-pointer"
              @click.stop="handleClickOnFeeDiscounts"
            >
              <IconCrown class="w-6 h-6 -mt-1" />
              <span
                class="text-primary-500 text-sm px-1 py-0.4 bg-primary-500 bg-opacity-10 rounded align-top"
              >
                {{
                  tierLevel > 0
                    ? $t('navigation.makerTakerFee', {
                        maker: makerFeeDiscount,
                        taker: makerFeeDiscount
                      })
                    : $t('navigation.noTierLevel')
                }}
              </span>
            </span>
          </div>
        </div>
        <div v-if="referralsEnabled" class="px-6 mt-6 pb-6">
          <div class="border-t"></div>
          <div class="flex items-center justify-between mt-6 text-sm">
            <h3 class="text-sm font-semibold tracking-wider uppercase">
              {{
                $t(
                  refereeInfo
                    ? 'navigation.referral'
                    : 'navigation.referralCode'
                )
              }}
            </h3>

            <a
              v-if="referralCode"
              :href="referralDashboardLink"
              target="_blank"
              class="cursor-pointer text-primary-500 font-semibold tracking-wide"
            >
              <div class="flex items-center">
                <span class="mr-2">
                  {{ referralCode }}
                </span>
                <IconArrow class="h-4 w-4 transform rotate-135" />
              </div>
            </a>
            <span v-else class="text-gray-500">&mdash;</span>
          </div>
        </div>
        <div
          class="pt-4 px-6 bg-gray-900"
          :class="{ 'mt-6': !referralsEnabled }"
        >
          <h3 class="text-xs tracking-wide uppercase">
            {{ $t('navigation.connectedWallets') }}
          </h3>
          <ul class="pt-4 pb-6">
            <ConnectedWallet v-if="wallet === Wallet.Metamask" lg>
              <IconMetamask class="w-8 h-8 mx-auto" />
            </ConnectedWallet>
            <ConnectedWallet v-if="wallet === Wallet.WalletConnect" lg>
              <IconWalletConnect class="w-8 h-8 mx-auto" />
            </ConnectedWallet>
            <ConnectedWallet v-if="wallet === Wallet.Keplr" lg>
              <img
                src="/keplr-icon.png"
                class="w-8 h-8 mx-auto"
                alt="Keplr Icon"
              />
            </ConnectedWallet>
            <ConnectedWallet v-if="wallet === Wallet.Ledger" lg>
              <IconLedger class="w-8 h-8 mx-auto" />
            </ConnectedWallet>
            <ConnectedWallet v-if="wallet === Wallet.Torus" lg>
              <IconTorus class="w-8 h-8 mx-auto" />
            </ConnectedWallet>
            <ConnectedWallet v-if="wallet === Wallet.Trezor" lg>
              <IconTrezor class="w-8 h-8 mx-auto" />
            </ConnectedWallet>
          </ul>
        </div>
      </div>
    </VPopperBox>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import {
  BigNumberInBase,
  BigNumberInWei,
  formatWalletAddress
} from '@injectivelabs/utils'
import { RefereeInfo, ReferrerInfo } from '@injectivelabs/referral-consumer'
import { Wallet } from '@injectivelabs/ts-types'
import { FeeDiscountAccountInfo } from '@injectivelabs/sdk-ts'
import ConnectedWallet from './connected-wallet.vue'
import LogoMini from '~/components/elements/logo-mini.vue'
import VPopperBox from '~/components/elements/popper-box.vue'
import { getReferralUrl } from '~/app/utils/helpers'
import {
  REFERRALS_ENABLED,
  UI_DEFAULT_MIN_DISPLAY_DECIMALS
} from '~/app/utils/constants'

export default Vue.extend({
  components: {
    VPopperBox,
    LogoMini,
    ConnectedWallet
  },

  data() {
    return {
      Wallet,
      REFERRALS_ENABLED,
      isInjectiveAddress: true,
      isWalletDropdownOpen: false,
      popperOption: {
        placement: 'bottom-start',
        modifiers: [
          {
            name: 'offset',
            options: {
              offset: [0, 8]
            }
          }
        ]
      }
    }
  },

  computed: {
    isUserWalletConnected(): boolean {
      return this.$accessor.wallet.isUserWalletConnected
    },

    wallet(): Wallet {
      return this.$accessor.wallet.wallet
    },

    address(): string {
      return this.$accessor.wallet.address
    },

    injectiveAddress(): string {
      return this.$accessor.wallet.injectiveAddress
    },

    refereeInfo(): RefereeInfo | undefined {
      return this.$accessor.referral.refereeInfo
    },

    referrerInfo(): ReferrerInfo | undefined {
      return this.$accessor.referral.referrerInfo
    },

    feeDiscountAccountInfo(): FeeDiscountAccountInfo | undefined {
      return this.$accessor.exchange.feeDiscountAccountInfo
    },

    tierLevel(): number {
      const { feeDiscountAccountInfo } = this

      if (!feeDiscountAccountInfo) {
        return 0
      }

      return new BigNumberInBase(
        feeDiscountAccountInfo.tierLevel || 0
      ).toNumber()
    },

    makerFeeDiscount(): string {
      const { feeDiscountAccountInfo } = this

      if (!feeDiscountAccountInfo) {
        return ''
      }

      if (!feeDiscountAccountInfo.accountInfo) {
        return ''
      }

      return new BigNumberInWei(
        feeDiscountAccountInfo.accountInfo.makerDiscountRate
      )
        .toBase()
        .toFormat(UI_DEFAULT_MIN_DISPLAY_DECIMALS)
    },

    takerFeeDiscount(): string {
      const { feeDiscountAccountInfo } = this

      if (!feeDiscountAccountInfo) {
        return ''
      }

      if (!feeDiscountAccountInfo.accountInfo) {
        return ''
      }

      return new BigNumberInWei(
        feeDiscountAccountInfo.accountInfo.takerDiscountRate
      )
        .toBase()
        .toFormat(UI_DEFAULT_MIN_DISPLAY_DECIMALS)
    },

    referralCode(): string | undefined {
      const { refereeInfo, referrerInfo } = this

      if (!refereeInfo && !referrerInfo) {
        return undefined
      }

      return refereeInfo?.referralCode || referrerInfo?.referralCode
    },

    referralsEnabled(): boolean {
      const { referralCode } = this

      return !!(REFERRALS_ENABLED && referralCode)
    },

    referralDashboardLink(): string {
      return getReferralUrl()
    },

    formattedAddress(): string {
      const { address } = this

      return formatWalletAddress(address)
    },

    formattedInjectiveAddress(): string {
      const { injectiveAddress } = this

      return formatWalletAddress(injectiveAddress)
    },

    $popper(): any {
      return this.$refs['popper-wallet']
    }
  },

  methods: {
    handleClickOnLogout() {
      this.$accessor.wallet.logout()

      if (['activity', 'portfolio'].includes(this.$route.name as string)) {
        this.$router.push({ name: 'index' })
      }
    },

    handleClickOnFeeDiscounts() {
      this.$router.push({ name: 'fee-discounts' })
    },

    handleShowDropdown() {
      if (this.$popper) {
        this.$popper.showDropdown()
      }

      this.isWalletDropdownOpen = true
    },

    handleHideDropdown() {
      if (this.$popper) {
        this.$popper.hideDropdown()
      }

      this.isWalletDropdownOpen = false
    }
  }
})
</script>
