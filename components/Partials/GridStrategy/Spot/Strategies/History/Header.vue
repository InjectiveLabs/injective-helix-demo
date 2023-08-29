<template>
  <div class="grid grid-cols-8 text-xs p-4 gap-2">
    <div>Time</div>
    <div>Market</div>
    <div class="text-right">Upper Bound</div>
    <div class="text-right">Lower Bound</div>
    <div class="text-right">
      <CommonHeaderTooltip
        :tooltip="'Amounts may be less than initially entered due to fees, ensuring optimal strategy execution with sufficient INJ and USDT.'"
      >
        <span class="text-white">Investment</span>
      </CommonHeaderTooltip>
    </div>
    <div class="text-right">PnL</div>
    <div class="text-right">Duration</div>
    <div class="text-center">View Order Details</div>
  </div>
</template>
