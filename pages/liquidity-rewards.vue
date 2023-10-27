<script setup lang="ts">
//
</script>

<template>
  <div class="mx-auto max-w-7xl w-full px-4 space-y-8">
    <PartialsLiquidityHeader />
    <PartialsLiquidityRewardStats />
    <PartialsLiquidityTab />

    <div class="overflow-x-auto">
      <table class="w-full min-w-[742px]">
        <PartialsLiquidityTableHeader />
        <tbody>
          <PartialsLiquidityTableRow v-for="i in 10" :key="`row-${i}`" />
        </tbody>
      </table>
    </div>

    <AppPagination v-bind="{ limit: 10, page: 3, totalCount: 100 }" />
  </div>
</template>
