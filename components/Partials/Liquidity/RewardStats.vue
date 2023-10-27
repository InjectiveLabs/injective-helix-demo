<template>
  <div class="bg-gray-800 rounded-md p-8">
    <h2 class="font-semibold mb-4">{{ $t('campaign.rewardStats') }}</h2>

    <div class="flex">
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 flex-1">
        <div class="md:col-span-2">
          <p class="text-xs uppercase pb-1">{{ $t('campaign.address') }}</p>
          <h2 class="text-sm truncate text-blue-500">
            inj1akxycslq8cjt0uffw4rjmfm3echchptu52a3op
          </h2>
        </div>
        <div>
          <p class="text-xs uppercase pb-1">{{ $t('campaign.volume') }}</p>
          <h2 class="text-sm">45,235.23 USD</h2>
        </div>
        <div>
          <p class="text-xs uppercase pb-1">{{ $t('campaign.rank') }}</p>
          <h2 class="text-sm">40 🏆</h2>
        </div>
        <div>
          <p class="text-xs uppercase pb-1">{{ $t('campaign.estRewards') }}</p>
          <h2 class="text-sm">100 INJ</h2>
        </div>
      </div>

      <div>
        <AppButton class="border border-blue-500">
          <span class="text-blue-500 font-semibold">
            {{ $t('campaign.claim') }}
          </span>
        </AppButton>
      </div>
    </div>
  </div>
</template>
