<template>
  <div class="h-full w-full flex flex-wrap pt-4">
    <HOCLoading :status="status">
      <div class="container">
        <div class="w-full mx-auto xl:w-4/5">
          <!-- header nav -->
          <div
            class="flex justify-center uppercase text-gray-500 text-xs sm:text-sm font-semibold pt-6 xs:w-4/5 md:w-full mx-auto"
          >
            <VHeaderItem
              class="w-1/2 text-right mr-6"
              :class="{ 'text-primary-500': selectedType === DMMType.Ranking }"
              :type="DMMType.Ranking"
              @click="handleTypeClick"
            >
              {{ $t('dmm.nav.dedicatedMarketMakingRankings') }}
            </VHeaderItem>

            <span class="border-r text-gray-500 w-1" />

            <VHeaderItem
              class="w-1/2 ml-6"
              :class="{ 'text-primary-500': selectedType === DMMType.History }"
              :type="DMMType.History"
              @click="handleTypeClick"
            >
              {{ $t('dmm.nav.currentEpochRecords') }}
            </VHeaderItem>
          </div>

          <div v-if="selectedType === DMMType.Ranking" class="mt-6">
            <VEpochSelector
              :disabled="fetchEpochStatus.isLoading()"
              @update="fetchEpochSummary"
            />
            <div
              class="relative"
              :class="{ 'mt-8': fetchEpochStatus.isLoading() }"
            >
              <HOCLoading :status="fetchEpochStatus">
                <div>
                  <VSummary class="mt-8" />
                  <VRanking class="mt-8" />
                  <VResource class="mt-8 mb-14" />
                </div>
              </HOCLoading>
            </div>
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
      status: new Status(StatusType.Loading),
      fetchEpochStatus: new Status(StatusType.Idle)
    }
  },

  computed: {
    activeEpochId(): string {
      return this.$accessor.dmm.activeEpochId
    }
  },

  mounted() {
    Promise.all([
      this.$accessor.dmm.fetchEpochs(),
      this.$accessor.dmm.fetchEpochSummary()
    ])
      .then(() => {
        //
      })
      .catch(this.$onRejected)
      .finally(() => {
        this.status.setIdle()
      })
  },

  methods: {
    handleTypeClick(type: DMMType) {
      this.selectedType = type
    },

    fetchEpochSummary(epochId: string) {
      const { activeEpochId } = this

      if (activeEpochId !== epochId) {
        this.$accessor.dmm.setActiveEpochId(epochId)
        this.fetchEpochStatus.setLoading()

        this.$accessor.dmm
          .fetchEpochSummary(epochId)
          .then(() => {
            //
          })
          .catch(this.$onRejected)
          .finally(() => {
            this.fetchEpochStatus.setIdle()
          })
      }
    }
  }
})
</script>
