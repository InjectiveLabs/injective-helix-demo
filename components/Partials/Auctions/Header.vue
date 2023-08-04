<template>
  <div class="flex flex-col md:flex-row gap-4">
    <div class="basis-64">
      <div
        class="bg-white rounded-2xl p-4 max-w-md mx-auto overflow-hidden group"
      >
        <img
          src="/images/talis-logo.svg"
          alt=""
          class="aspect-square w-full object-contain group-hover:scale-110 transition-transform duration-300"
        />
      </div>
    </div>
    <div class="flex-1 p-4 space-y-4">
      <div class="flex items-center space-x-4">
        <img
          src="/images/talis-logo.svg"
          alt=""
          class="aspect-square w-12 object-contain bg-white rounded-full p-1"
        />
        <h3 class="text-4xl font-bold">TALIS</h3>
        <p
          class="font-bold text-sm py-0.5 px-2 rounded-md text-black"
          :class="[
            $route.query.isUpcoming === 'true'
              ? 'bg-orange-500'
              : 'bg-green-500'
          ]"
        >
          {{ $route.query.isUpcoming === 'true' ? 'UPCOMING' : 'LIVE' }}
        </p>
      </div>

      <p class="max-w-md">
        The NFT marketplace that empowers artists and bridges physical & digital
        art on the Injective.
      </p>

      <div class="flex gap-8">
        <div>
          <h3 class="text-gray-400 uppercase font-semibold">Tokens Offered</h3>
          <p>100,000 Talis</p>
        </div>
        <div>
          <h3 class="text-gray-400 uppercase font-semibold">Auction Time</h3>
          <p>Jul 15, 2023 10:00 UTC</p>
        </div>
      </div>
    </div>
  </div>
</template>
