<script lang="ts" setup>
const { t } = useLang()

const FilterList = {
  Boosted: 'Boosted',
  Disqualified: 'Disqualified'
}

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
          <template #default="{ isActive }">
            <span
              class="text-sm"
              :class="[isActive ? 'text-blue-500' : 'text-coolGray-500']"
            >
              <span v-if="filterType === FilterList.Boosted">
                {{ t('trade.boostedMarkets') }}
              </span>

              <span v-if="filterType === FilterList.Disqualified">
                {{ t('trade.disqualifiedMarkets') }}
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
    </div>
  </AppPanel>
</template>
