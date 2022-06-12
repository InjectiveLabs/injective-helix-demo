<template>
  <VCard
    v-if="showWelcomeBanner && status.isNotLoading()"
    md
    :style="{ backgroundImage: `url('/svg/bg-dark.svg')` }"
    class="bg-cover mb-12"
    data-cy="welcome-banner-component"
  >
    <div class="grid grid-cols-1 3md:grid-cols-3 lg:grid-cols-2 3md:gap-4">
      <div class="3md:col-span-2 lg:col-span-1">
        <p class="font-bold text-xl mb-2">{{ $t('banners.welcome.title') }}</p>
        <p class="text-sm text-gray-500 mb-4">
          {{ $t('banners.welcome.subtitle') }}
        </p>
        <img
          src="/images/sphere.png"
          class="3md:hidden w-40 sm:w-44 mb-6 mt-4 mx-auto"
        />
        <ProgressSteps :steps="3" :active-step="activeStep" />
        <div
          class="flex w-full justify-between tracking-wide uppercase mt-2.5 text-xs text-gray-500"
        >
          <span class="text-primary-500">01 {{ $t('common.deposit') }}</span>
          <span :class="{ 'text-primary-500': activeStep > 1 }">
            02 {{ $t('common.transfer') }}
          </span>
          <span :class="{ 'text-primary-500': activeStep > 2 }">
            03 {{ $t('common.trade') }}
          </span>
        </div>
        <div
          class="w-full sm:w-1/3 md:w-2/5 font-semibold mt-4 text-sm"
          :class="{
            'mx-auto': activeStep === 2,
            'ml-auto text-right': activeStep === 3
          }"
        >
          <p v-if="activeStep === 1">
            {{ $t('banners.welcome.depositDescription') }}
          </p>
          <p v-else-if="activeStep === 2">
            {{ $t('banners.welcome.transferDescription') }}
          </p>
          <p v-else>
            {{ $t('banners.welcome.tradeDescription') }}
          </p>

          <p :class="{ 'text-center': activeStep === 2 }">
            <VButton
              type="button"
              lg
              primary
              class="mt-4 w-40"
              data-cy="welcome-banner-action-button"
              @click.native="handleClickOnButton"
            >
              <span v-if="activeStep === 1">{{ $t('common.deposit') }}</span>
              <span v-else-if="activeStep === 2">
                {{ $t('common.transfer') }}
              </span>
              <span v-else>{{ $t('common.trade') }}</span>
            </VButton>
          </p>
        </div>
      </div>

      <div class="mt-8 3md:mt-0">
        <div class="3md:text-right text-sm 3md:text-xs lg:text-sm">
          <a
            href=" https://injectiveprotocol.zendesk.com/hc/en-us/sections/4415560819860--Bridge"
            target="_blank"
            class="inline-block mr-4"
          >
            <span class="bg-gray-900 py-2 px-4 flex items-center rounded-full">
              <span>{{ $t('banners.welcome.howItWorks') }}</span>
              <IconArrow class="w-3 h-3 rotate-[135deg] ml-2" />
            </span>
          </a>

          <a
            href=" https://injectiveprotocol.zendesk.com/hc/en-us/sections/4415560819860--Bridge"
            target="_blank"
            class="inline-block"
          >
            <span class="bg-gray-900 py-2 px-4 flex items-center rounded-full">
              <span>{{ $t('banners.welcome.faq') }}</span>
              <IconArrow class="w-3 h-3 rotate-[135deg] ml-2" />
            </span>
          </a>
        </div>

        <img
          src="/images/sphere.png"
          class="hidden 3md:block w-44 mt-4 ml-auto"
        />
      </div>
    </div>
  </VCard>
</template>

<script lang="ts">
import Vue from 'vue'
import { Status, StatusType } from '@injectivelabs/utils'

export default Vue.extend({
  data() {
    return {
      status: new Status(StatusType.Loading)
    }
  },

  computed: {
    hasAnyBankBalances(): boolean {
      return this.$accessor.bank.hasAnyBankBalance
    },

    hasAnyTradingAccountBalances(): any {
      return this.$accessor.account.hasAnyTradingAccountBalances
    },

    hasMadeAnyTransfers(): boolean {
      return this.$accessor.onboard.hasMadeAnyTransfers
    },

    hasMadeAnyTrades(): boolean {
      return this.$accessor.onboard.hasMadeAnyTrades
    },

    activeStep(): number {
      if (!this.hasAnyBankBalances) {
        return 1
      }

      if (!this.hasMadeAnyTransfers) {
        return 2
      }

      return 3
    },

    showWelcomeBanner(): boolean {
      const {
        hasMadeAnyTransfers,
        hasAnyTradingAccountBalances,
        hasMadeAnyTrades
      } = this

      return (
        (!hasMadeAnyTransfers && !hasAnyTradingAccountBalances) ||
        !hasMadeAnyTrades
      )
    }
  },

  mounted() {
    Promise.all([this.$accessor.onboard.init()])
      .then(() => {})
      .catch(this.$onError)
      .finally(() => {
        this.status.setIdle()
      })
  },

  methods: {
    handleClickOnButton() {
      if (this.activeStep === 1) {
        this.$root.$emit('bridge:deposit')
      } else if (this.activeStep === 2) {
        this.$root.$emit('bridge:transfer')
      } else {
        this.$router.push({
          name: 'derivatives-derivative',
          params: { derivative: 'btc-usdt-perp' }
        })
      }
    }
  }
})
</script>
