<script setup lang="ts">
const active = ref('overview.tradingBotsTitle')

const options = [
  {
    title: 'overview.tradingBotsTitle',
    description: 'overview.tradingBotsDescription'
  },
  {
    title: 'overview.newAccountsTitle',
    description: 'overview.newAccountsDescription'
  },
  {
    title: 'overview.pnlTitle',
    description: 'overview.pnlDescription'
  },
  {
    title: 'overview.gasFreeTitle',
    description: 'overview.gasFreeDescription'
  }
]

function setActive(title: string) {
  active.value = title
}
</script>

<template>
  <div>
    <h2
      class="text-xl lg:text-3xl whitespace-pre-wrap text-center font-semibold"
    >
      {{ $t('home.overviewTitle') }}
    </h2>

    <div class="grid grid-cols-1 lg:grid-cols-2 mt-10 gap-10">
      <div>
        <div
          v-for="{ description, title } in options"
          :key="title"
          class="hover:bg-brand-875 p-6 rounded-lg cursor-pointer flex"
          @click="setActive(title)"
        >
          <div class="flex-1">
            <h2 :class="{ 'text-blue-500': active === title }" class="text-xl">
              {{ $t('home.' + title) }}
            </h2>
            <p
              :class="{ 'text-white': active === title }"
              class="text-xs text-gray-400"
            >
              {{ $t('home.' + description) }}
            </p>
          </div>
          <div class="flex items-center">
            <div class="rotate-180 text-gray-400">
              <SharedIcon name="arrow" />
            </div>
          </div>
        </div>
      </div>
      <div>
        <img class="h-80 mx-auto" src="/images/hero_image.png" alt="" />
      </div>
    </div>
  </div>
</template>
