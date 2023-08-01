<template>
  <div class="max-w-7xl mx-auto px-2 sm:px-4 md:px-8 min-h-screen pb-20">
    <div>
      <NuxtLink
        to="/auctions"
        class="flex items-center text-2xl space-x-4 py-4 hover:text-blue-400 transition-colors duration-300"
      >
        <BaseIcon name="chevron" />
        <span>Back to All Auctions</span>
      </NuxtLink>
    </div>

    <PartialsAuctionsHeader />

    <div class="flex space-x-4 py-4 md:py-8">
      <NuxtLink to="/auctions/talis">Project Details</NuxtLink>
      <NuxtLink to="/auctions/talis/bid">My Bid</NuxtLink>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8">
      <div class="bg-gray-800 rounded-2xl p-8">
        <NuxtPage />
      </div>

      <div class="bg-gray-800 rounded-2xl p-8">
        <PartialsAuctionsForm />
      </div>
    </div>
  </div>
</template>

<style scoped>
a {
  @apply text-xl transition-colors duration-300;
}
a.router-link-exact-active {
  @apply text-blue-500;
}
</style>
