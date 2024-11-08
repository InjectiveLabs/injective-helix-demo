<script lang="ts" setup>
const benefits = [
  {
    title: 'permisionedMarketsTitle',
    body: 'permisionedMarketsBody',
    icon: 'permisioned_markets.svg'
  },
  {
    title: 'multiAssetSupportTitle',
    body: 'multiAssetSupportBody',
    icon: 'multi_asset.svg'
  },
  {
    title: 'onChainTransparencyTitle',
    body: 'onChainTransparencyBody',
    icon: 'onchain_transparency.svg'
  },
  {
    title: 'robustSecurityTitle',
    body: 'robustSecurityBody',
    icon: 'fully_compliant.svg'
  },
  {
    title: 'instantSettlementTitle',
    body: 'instantSettlementBody',
    icon: 'instant_settlement.svg'
  },
  {
    title: 'superiorInfrastructureTitle',
    body: 'superiorInfrastructureBody',
    icon: 'bespoke_infrastructure.svg'
  }
]
</script>

<template>
  <div>
    <p class="text-xl mb-4">{{ $t('institutional.benefits') }}</p>

    <h2 class="text-4xl max-w-md mb-8">
      {{ $t('institutional.whyFinancialInstitutionsChooseHelix') }}
    </h2>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        v-for="item in benefits"
        :key="item.title"
        class="bg-coolGray-950 p-5 group hover:bg-coolGray-700 cursor-pointer rounded-xl transition-all duration-300"
      >
        <div>
          <img
            :src="`/images/benefits/${item.icon}`"
            alt=""
            class="bg-coolGray-800 p-3 rounded-full group-hover:invert transition-all duration-300"
          />
        </div>

        <div>
          <h3 class="text-2xl font-medium py-4">
            {{ $t(`institutional.${item.title}`) }}
          </h3>
          <p>{{ $t(`institutional.${item.body}`) }}</p>
        </div>
      </div>
    </div>
  </div>
</template>
