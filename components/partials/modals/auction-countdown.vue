<template>
  <!-- eslint-disable vue/no-v-html -->
  <v-modal :is-open="isModalOpen" sm @modal-closed="closeModal">
    <div slot="title" class="text-center">
      <h3 class="text-base">
        {{ $t('auction.countdown.title') }}
      </h3>
    </div>

    <div class="relative -mt-6 text-center">
      <div class="text-gradient text-4xl mb-8">
        {{ countDownTimer }}
      </div>
      <div>
        <a :href="auctionUrl" target="_blank" @click="closeModal">
          <v-button primary lg>
            <span>{{ $t('auction.countdown.button') }}</span>
          </v-button>
        </a>
      </div>
    </div>
  </v-modal>
</template>

<script lang="ts">
import Vue from 'vue'
import { Network } from '@injectivelabs/networks'
import { AuctionModuleState } from '@injectivelabs/chain-consumer'
import { differenceInSeconds, fromUnixTime } from 'date-fns'
import { Modal } from '~/types'
import { NETWORK } from '~/app/utils/constants'
import { formatDurationFromSeconds } from '~/app/utils/time'
import { hardcodedAuctionRound } from '~/store/auction'

export default Vue.extend({
  data() {
    return {
      now: Date.now()
    }
  },

  computed: {
    auctionsViewed(): number[] {
      return this.$accessor.auction.auctionsViewed
    },

    auctionModuleState(): AuctionModuleState | undefined {
      return this.$accessor.auction.auctionModuleState
    },

    isModalOpen(): boolean {
      return this.$accessor.modal.modals[Modal.AuctionCountdown]
    },

    timeDifferenceInSeconds(): number {
      const { now, auctionModuleState } = this

      if (!auctionModuleState) {
        return 0
      }

      if (auctionModuleState.auctionEndingTimestamp) {
        if (auctionModuleState.auctionEndingTimestamp > Date.now()) {
          return 0
        }

        const auctionEndDate = fromUnixTime(
          Number(auctionModuleState.auctionEndingTimestamp)
        )

        return differenceInSeconds(auctionEndDate, now)
      }

      return 0
    },

    countDownTimer(): string {
      const { timeDifferenceInSeconds } = this

      const countdownTimer = formatDurationFromSeconds(timeDifferenceInSeconds)

      if (countdownTimer === '') {
        return '00h 00m 00s'
      }

      if (!countdownTimer.includes('d')) {
        if (!countdownTimer.includes('h') && !countdownTimer.includes('m')) {
          return `00h 00m ${countdownTimer}`
        }

        if (!countdownTimer.includes('h') && !countdownTimer.includes('s')) {
          return `00h ${countdownTimer} 00s`
        }

        if (!countdownTimer.includes('h')) {
          return `00h ${countdownTimer}`
        }
      }

      return countdownTimer
    },

    auctionUrl() {
      if (NETWORK === Network.Devnet) {
        return 'https://devnet.hub.injective.dev/auction'
      }

      if (NETWORK === Network.Testnet) {
        return 'https://hub.injective.dev/auction'
      }

      return 'https://hub.injective.network/auction'
    }
  },

  mounted() {
    this.setIntervalForNow()
  },

  methods: {
    setIntervalForNow() {
      setInterval(() => {
        this.now = Date.now()
      }, 1000)
    },

    closeModal() {
      const { auctionModuleState } = this

      const round = auctionModuleState?.auctionRound || hardcodedAuctionRound
      // store viewed status in auction cache
      this.$accessor.auction.setAuctionsViewed(round)
      this.$accessor.modal.closeModal(Modal.AuctionCountdown)
    }
  }
})
</script>
