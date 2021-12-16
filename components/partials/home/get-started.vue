<template>
  <div>
    <h3 class="text-xl font-bold text-gray-200">
      {{ $t('getting_started') }}
    </h3>
    <div class="grid grid-cols-4 md:grid-cols-12 gap-4 lg:gap-6 mt-6">
      <v-onboarding-card class="col-span-4">
        <template slot="title">
          <span class="font-black">1.</span> {{ cards.bridge.title }}
        </template>
        <a
          slot="link"
          :href="cards.bridge.link"
          class="text-primary-500 hover:text-primary-600"
          target="_blank"
        >
          {{ cards.bridge.linkText }}
        </a>
        {{ cards.bridge.description }}
      </v-onboarding-card>
      <v-onboarding-card class="col-span-4">
        <template slot="title">
          <span class="font-black">2.</span> {{ cards.deposit.title }}
        </template>
        <span slot="link">
          <span
            class="cursor-pointer text-primary-500 hover:text-primary-600"
            @click.stop="openDepositToSubaccountModal"
          >
            {{ cards.deposit.linkText }}
          </span>
        </span>
        {{ cards.deposit.description }}
      </v-onboarding-card>
      <v-onboarding-card class="col-span-4">
        <template slot="title">
          <span class="font-black">3.</span> {{ cards.trading.title }}
        </template>
        <span slot="link">
          <span
            class="cursor-pointer text-primary-500 hover:text-primary-600"
            @click.stop="openMarketSlideout"
          >
            {{ cards.trading.linkText }}
          </span>
        </span>
        {{ cards.trading.description }}
      </v-onboarding-card>
    </div>
    <v-modal-subaccount-deposit-with-select />
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import VOnboardingCard from '~/components/elements/onboarding-card.vue'
import VModalSubaccountDepositWithSelect from '~/components/partials/modals/subaccount-deposit-with-select/index.vue'
import { Modal } from '~/types'

export default Vue.extend({
  components: {
    VOnboardingCard,
    VModalSubaccountDepositWithSelect
  },

  data() {
    return {
      cards: {
        bridge: {
          title: 'Bridge Assets',
          link: 'https://hub.injective.network/bridge',
          description:
            'Bridge assets from Ethereum, Cosmoshub or Terra to the Injective Chain.',
          linkText: 'Bridge Now'
        },
        deposit: {
          title: 'Deposit to Trading Account',
          description:
            'After successfully bridging the assets to Injective chain, move the desired amount to your trading account.',
          linkText: 'Deposit'
        },
        trading: {
          title: 'Start Trading',
          description:
            'Select your desired market and start trading with zero gas fees and earn Astro rewards for every trade you make.',
          linkText: 'Select Market'
        }
      }
    }
  },

  computed: {
    isUserWalletConnected(): boolean {
      return this.$accessor.wallet.isUserWalletConnected
    }
  },

  methods: {
    openMarketSlideout() {
      this.$root.$emit('toggle-market-slideout-from-content')
    },

    openDepositToSubaccountModal() {
      const { isUserWalletConnected } = this

      if (isUserWalletConnected) {
        this.$accessor.modal.openModal(Modal.SubaccountDepositWithSelect)
      } else {
        this.$root.$emit('wallet-clicked')
      }
    }
  }
})
</script>
