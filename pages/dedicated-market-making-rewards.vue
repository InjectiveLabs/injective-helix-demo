<template>
  <div class="h-full w-full flex flex-wrap pt-4">
    <HOCLoading :status="status">
      <div class="container">
        <div class="w-full mx-auto xl:w-4/5">
          <!-- header nav -->
          <div
            class="flex justify-center uppercase text-gray-500 text-sm font-semibold pt-6"
          >
            <VHeaderItem
              :class="{ 'text-primary-500': selectedType === DMMType.Ranking }"
              :type="DMMType.Ranking"
              @click="handleTypeClick"
            >
              {{ $t('dmm.nav.dedicatedMarketMakingRanking') }}
            </VHeaderItem>
            <span class="mx-6">|</span>
            <VHeaderItem
              :class="{ 'text-primary-500': selectedType === DMMType.History }"
              :type="DMMType.History"
              @click="handleTypeClick"
            >
              {{ $t('dmm.nav.marketMakingHistory') }}
            </VHeaderItem>
          </div>

          <div v-if="selectedType === DMMType.Ranking" class="mt-6">
            <VEpochSelector :selected-epoch.sync="epoch" />
            <VSummary class="mt-8" />
            <VRanking class="mt-8" />

            <VResource class="mt-8 mb-14" />
          </div>

          <div v-if="selectedType === DMMType.History" class="mt-6">
            <VHistory class="mt-8" />
          </div>
        </div>
      </div>
    </HOCLoading>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { Status, StatusType } from '@injectivelabs/utils'
import { DMMType } from '~/types/enums'
import HOCLoading from '~/components/hoc/loading.vue'
import VEpochSelector from '~/components/partials/dmm/common/epoch-selector.vue'
import VHeaderItem from '~/components/partials/dmm/header-item.vue'
import VHistory from '~/components/partials/dmm/history/index.vue'
import VRanking from '~/components/partials/dmm/ranking/index.vue'
import VResource from '~/components/partials/dmm/resources/index.vue'
import VSummary from '~/components/partials/dmm/summary/index.vue'

export default Vue.extend({
  components: {
    HOCLoading,
    VEpochSelector,
    VHeaderItem,
    VHistory,
    VRanking,
    VResource,
    VSummary
  },

  data() {
    return {
      DMMType,
      selectedType: DMMType.Ranking,
      status: new Status(StatusType.Idle),
      epoch: {
        id: 1,
        text: 'Oct 21 - Oct 30'
      }
    }
  },

  mounted() {},

  methods: {
    handleTypeClick(type: DMMType) {
      this.selectedType = type
    }
  }
})
</script>
