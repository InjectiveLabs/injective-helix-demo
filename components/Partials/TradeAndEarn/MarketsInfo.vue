<script lang="ts" setup>
const FilterList = {
  // QuoteDenoms: 'QuoteDenoms',
  Boosted: 'Boosted',
  Disqualified: 'Disqualified'
}

const { t } = useLang()

const activeType = ref(FilterList.Boosted)
</script>

<template>
  <AppPanel :title="t('trade.marketsInformation')" card-wrapper-class="mt-6">
    <div class="flex items-center gap-2">
      <template
        v-for="(filterType, index) in Object.values(FilterList)"
        :key="`market-information-type-${filterType}`"
      >
        <AppSelectButton v-model="activeType" :value="filterType">
          <template #default="{ active }">
            <span
              class="text-sm"
              :class="[active ? 'text-blue-500' : 'text-gray-500']"
            >
              <!-- <span v-if="filterType === FilterList.QuoteDenoms">
                {{ t('trade.quote_denoms') }}
              </span> -->

              <span v-if="filterType === FilterList.Boosted">
                {{ t('trade.boosted_markets') }}
              </span>

              <span v-if="filterType === FilterList.Disqualified">
                {{ t('trade.disqualified_markets') }}
              </span>
            </span>
          </template>
        </AppSelectButton>

        <CommonSeparator
          v-if="index !== Object.values(FilterList).length - 1"
        />
      </template>
    </div>

    <div class="mt-4">
      <PartialsTradeAndEarnMarketsInfoBoosted
        v-if="activeType === FilterList.Boosted"
      />
      <PartialsTradeAndEarnMarketsInfoDisqualified
        v-if="activeType === FilterList.Disqualified"
      />
      <!-- <PartialsTradeAndEarnMarketsInfoQuoteDenoms
        v-if="activeType === FilterList.QuoteDenoms"
      /> -->
    </div>
  </AppPanel>
</template>
