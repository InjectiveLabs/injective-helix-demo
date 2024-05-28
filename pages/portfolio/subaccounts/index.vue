<script setup lang="ts">
//
</script>

<template>
  <div>
    <div class="p-4">
      <h2 class="portfolio-title">
        {{ $t('navigation.subaccounts') }}
      </h2>

      <p class="text-xs font-xs text-gray-400 max-w-xl mt-2">
        This is a secondary account linked to your main account for separate
        management and trading of digital assets. To activate it, you first need
        to transfer funds. Learn more about subaccounts in our FAQ.
      </p>
    </div>

    <div class="divide-y border-y">
      <PartialsPortfolioSubaccountsTableHeader />
      <CommonSubaccountOptions
        :include-bots-subaccounts="true"
        :show-low-balance="true"
      >
        <template #default="{ subaccountOptions }">
          <PartialsPortfolioSubaccountsTableRow
            v-for="subaccount in subaccountOptions"
            :key="subaccount.value"
            v-bind="{ subaccount }"
          />
        </template>
      </CommonSubaccountOptions>
    </div>
  </div>
</template>
