<template>
  <v-modal :is-open="isModalOpen" @modal-closed="closeModal">
    <h3 slot="title">
      {{ $t('deposit_zero_gas_fees') }}
    </h3>

    <div class="relative">
      <p class="text-gray-300">
        {{ $t('gas_fee_rebates_steps') }}
      </p>
      <div class="mt-4 pt-4 border-t">
        <v-step-circle :active="hasDepositedMoreThanMinimalUsdt">
          <template slot="title">
            {{ $t('step_number', { number: 1, total: 2 }) }}
          </template>
          <span>
            {{
              $t('step_1_gas_fee_rebate', {
                amount: MIN_AMOUNT_REQUIRED_FOR_GAS_REBATE,
                date
              })
            }}
          </span>
        </v-step-circle>
        <v-step-circle
          :active="
            hasDepositedMoreThanMinimalUsdt && hasTradeWithMinimumNotionalUsdt
          "
        >
          <template slot="title">
            {{ $t('step_number', { number: 2, total: 2 }) }}
          </template>
          <span>
            {{
              $t('step_2_gas_fee_rebate', {
                amount: MIN_AMOUNT_REQUIRED_FOR_GAS_REBATE
              })
            }}
          </span>
        </v-step-circle>
      </div>
      <div class="mt-6">
        <p class="text-center text-xs text-gray-400">
          * {{ $t('gas_fee_rebate_note') }}
        </p>

        <v-button
          class="w-full mt-4"
          :status="status"
          lg
          :primary="canRedeem"
          :disabled="!canRedeem"
          @click.stop="handleClickOnRedeem"
        >
          {{ $t('redeem') }}
        </v-button>
      </div>
    </div>
  </v-modal>
</template>

<script lang="ts">
import Vue from 'vue'
import { format } from 'date-fns'
import { Status } from '@injectivelabs/utils'
import VStepCircle from '~/components/elements/step-circle.vue'
import {
  MIN_AMOUNT_REQUIRED_FOR_GAS_REBATE,
  MIN_TIMESTAMP_REQUIRED_FOR_GAS_REBATE
} from '~/app/utils/constants'
import { Modal } from '~/types'

export default Vue.extend({
  components: {
    VStepCircle
  },

  props: {
    hasTradeWithMinimumNotionalUsdt: {
      type: Boolean,
      required: true
    },

    hasDepositedMoreThanMinimalUsdt: {
      type: Boolean,
      required: true
    }
  },

  data() {
    return {
      status: new Status(),
      MIN_AMOUNT_REQUIRED_FOR_GAS_REBATE
    }
  },

  computed: {
    canRedeem(): boolean {
      const {
        hasDepositedMoreThanMinimalUsdt,
        hasTradeWithMinimumNotionalUsdt
      } = this

      return hasDepositedMoreThanMinimalUsdt && hasTradeWithMinimumNotionalUsdt
    },

    date(): string {
      return format(
        MIN_TIMESTAMP_REQUIRED_FOR_GAS_REBATE * 1000,
        'dd MMM HH:mm:ss'
      )
    },

    isModalOpen(): boolean {
      return this.$accessor.modal.modals[Modal.GasFeeRebate]
    }
  },

  methods: {
    closeModal() {
      this.$accessor.modal.closeModal(Modal.GasFeeRebate)
    },

    handleClickOnRedeem() {
      this.status.setLoading()

      this.$accessor.gasRebate
        .redeem()
        .then(() => {
          this.$toast.success(this.$t('redeem_success'))
        })
        .catch(this.$onRejected)
        .finally(() => {
          this.status.setIdle()
        })
    },

    handleCancel() {
      this.closeModal()
    }
  }
})
</script>
