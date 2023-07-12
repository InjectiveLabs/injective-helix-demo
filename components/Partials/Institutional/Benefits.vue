<script setup lang="ts">
const benefits = [
  {
    title: 'Permisioned Markets',
    body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque congue mollis diam, sed faucibus ante aliquet volutpat. Nunc ornare sodales mattis.',
    icon: 'permisioned_markets.svg'
  },
  {
    title: 'Multi-asset support',
    body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque congue mollis diam, sed faucibus ante aliquet volutpat. Nunc ornare sodales mattis.',
    icon: 'multi_asset.svg'
  },
  {
    title: 'On-chain Transparency',
    body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque congue mollis diam, sed faucibus ante aliquet volutpat. Nunc ornare sodales mattis.',
    icon: 'onchain_transparency.svg'
  },
  {
    title: 'Fully compliant',
    body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque congue mollis diam, sed faucibus ante aliquet volutpat. Nunc ornare sodales mattis.',
    icon: 'fully_compliant.svg'
  },
  {
    title: 'Instant settlement',
    body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque congue mollis diam, sed faucibus ante aliquet volutpat. Nunc ornare sodales mattis.',
    icon: 'instant_settlement.svg'
  },
  {
    title: 'Bespoke infrastructure',
    body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque congue mollis diam, sed faucibus ante aliquet volutpat. Nunc ornare sodales mattis.',
    icon: 'bespoke_infrastructure.svg'
  }
]
</script>

<template>
  <div>
    <p class="text-xl mb-4">Benefits</p>

    <h2 class="text-4xl max-w-md mb-8">
      Why financial institutions choose Helix
    </h2>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        v-for="item in benefits"
        :key="item.title"
        class="bg-gray-950 p-5 group hover:bg-gray-700 cursor-pointer rounded-xl transition-all duration-300"
      >
        <div>
          <img
            :src="`images/benefits/${item.icon}`"
            alt=""
            class="bg-gray-800 p-3 rounded-full group-hover:invert transition-all duration-300"
          />
        </div>

        <div>
          <h3 class="text-2xl font-medium py-4">{{ item.title }}</h3>
          <p>{{ item.body }}</p>
        </div>
      </div>
    </div>
  </div>
</template>
