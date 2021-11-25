<template>
  <v-modal dense :is-open="isModalOpen" @modal-closed="closeModal">
    <h3 slot="title">
      {{ $t('dmm.resource.modalTitle') }}
    </h3>

    <VMarketRewardTable class="mt-6" />
  </v-modal>
</template>

<script lang="ts">
import Vue from 'vue'
import VMarketRewardTable from './market-reward-table.vue'
import { Modal } from '~/types'

export default Vue.extend({
  components: {
    VMarketRewardTable
  },

  computed: {
    isModalOpen(): boolean {
      return this.$accessor.modal.modals[Modal.MarketRewardFactors]
    }
  },

  methods: {
    closeModal() {
      this.$accessor.modal.closeModal(Modal.MarketRewardFactors)
    }
  }
})
</script>
