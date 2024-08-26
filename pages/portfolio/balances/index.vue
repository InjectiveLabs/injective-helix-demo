<script setup lang="ts">
const appStore = useAppStore()
const accountStore = useAccountStore()
</script>

<template>
  <div>
    <h2 class="portfolio-title px px-4 pt-4">
      {{ $t('navigation.balances') }}
    </h2>

    <div class="lg:mt-8">
      <div class="lg:flex justify-between p-4">
        <div>
          <p class="text-gray-400 text-sm">
            {{ $t('portfolio.balances.netWorth') }}
          </p>
          <div class="flex items-center space-x-4">
            <p class="text-2xl font-semibold flex items-center space-x-2 h-12">
              <span>$</span>
              <CommonSkeletonSubaccountAmount
                :size="34"
                :spacing="8"
                :width="16"
              >
                <CommonHeadlessTotalBalance>
                  <template #default="{ accountTotalBalanceInUsd }">
                    <CommonNumberCounter
                      v-bind="{ value: accountTotalBalanceInUsd.toNumber() }"
                      :size="24"
                    />
                  </template>
                </CommonHeadlessTotalBalance>
              </CommonSkeletonSubaccountAmount>
            </p>

            <button
              class="text-gray-500 flex justify-center cursor-pointer"
              @click="appStore.toggleHideBalances"
            >
              <SharedIcon
                v-if="appStore.userState.preferences.isHideBalances"
                name="hide"
                class="w-8 h-5 -translate-x-[2px]"
              />

              <SharedIcon v-else name="show" class="w-7" />
            </button>
          </div>

          <p class="text-gray-400 text-sm flex items-center space-x-2 h-6">
            <span>≈</span>
            <CommonSkeletonSubaccountAmount>
              <CommonHeadlessTotalBalance>
                <template #default="{ accountTotalBalanceInBtc }">
                  <CommonNumberCounter
                    :decimals="4"
                    v-bind="{
                      value: accountTotalBalanceInBtc.toNumber(),
                      size: 14
                    }"
                  />
                </template>
              </CommonHeadlessTotalBalance>
            </CommonSkeletonSubaccountAmount>
            <span class="pb-[2px]">{{ $t('common.BTC') }}</span>
          </p>
        </div>

        <div
          class="flex space-y-2 max-md:flex-col md:items-center md:space-x-2 md:space-y-0"
        >
          <PartialsCommonBridgeRedirection
            v-bind="{
              isDeposit: true
            }"
          >
            <AppButton class="max-md:w-full">
              {{ $t('common.deposit') }}
            </AppButton>
          </PartialsCommonBridgeRedirection>

          <PartialsCommonBridgeRedirection>
            <AppButton variant="primary-outline" class="max-md:w-full">
              {{ $t('common.withdraw') }}
            </AppButton>
          </PartialsCommonBridgeRedirection>

          <PartialsCommonBridgeRedirection
            v-if="accountStore.isDefaultSubaccount"
            v-bind="{
              isTransfer: true
            }"
          >
            <AppButton class="max-md:w-full" variant="primary-outline">
              {{ $t('common.transfer') }}
            </AppButton>
          </PartialsCommonBridgeRedirection>
        </div>
      </div>

      <PartialsPortfolioBalancesSubaccount class="lg:mt-12" />
    </div>
  </div>
</template>
