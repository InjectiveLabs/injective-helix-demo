<template>
  <div class="grid grid-cols-9 text-xs p-4 gap-2">
    <div>Time</div>
    <div>Market</div>
    <div class="text-right">Lower Bound</div>
    <div class="text-right">Upper Bound</div>
    <div class="text-right">
      <CommonHeaderTooltip
        :tooltip="'Amounts may be less than initially entered due to fees, ensuring optimal strategy execution with sufficient INJ and USDT.'"
      >
        <span class="text-white">Investment</span>
      </CommonHeaderTooltip>
    </div>
    <div class="text-right">Total Profit</div>
    <div class="text-right">Duration</div>
    <div class="text-center">Order Details</div>
    <div class="text-center">Remove Strategy</div>
  </div>
</template>
