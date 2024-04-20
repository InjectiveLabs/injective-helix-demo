<script setup lang="ts">
const appStore = useAppStore()
</script>

<template>
  <div class="flex justify-between">
    <div class="space-y-2">
      <p class="text-gray-400 text-sm">
        {{ $t('portfolio.balances.netWorth') }}
      </p>
      <div class="flex items-center space-x-4">
        <p class="text-2xl font-semibold flex items-center space-x-2 h-12">
          <span>$</span>
          <CommonSkeletonSubaccountAmount :size="34" :spacing="8" :width="16">
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
          <BaseIcon
            v-if="appStore.userState.preferences.isHideBalances"
            name="hide"
            class="w-8 h-5 -translate-x-[2px]"
          />

          <BaseIcon v-else name="show" class="w-7" />
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
        <span class="pb-[2px]">BTC</span>
      </p>
    </div>

    <div class="flex items-center space-x-2">
      <AppButton>{{ $t('common.deposit') }}</AppButton>

      <AppButton variant="primary-outline">
        {{ $t('common.withdraw') }}
      </AppButton>

      <AppButton variant="primary-outline">
        {{ $t('common.transfer') }}
      </AppButton>
    </div>
  </div>
</template>
