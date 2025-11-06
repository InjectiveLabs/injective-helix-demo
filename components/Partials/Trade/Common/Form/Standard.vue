<template>
  <div>
    <slot name="typeSelector" />
    <slot name="sideSelector" />
    <slot name="leverage" />
    <slot name="triggerPriceField" />
    <slot name="limitPriceField" />
    <slot name="amountField" />
    <slot name="advancedSettings" />
    <slot name="details" />
    <slot name="createOrder" />
    <PartialsTradeCommonFormAccountEquity class="mt-6" />
  </div>
</template>
