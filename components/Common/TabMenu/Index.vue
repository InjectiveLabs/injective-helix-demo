<template>
  <div
    class="flex items-center justify-between flex-wrap border-b border-b-coolGray-600"
  >
    <div
      class="flex items-center gap-2 3md:gap-4 overflow-x-auto justify-between xs:justify-start w-full xs:w-auto hide-scrollbar mb-[-2px]"
    >
      <slot />
    </div>
    <div
      class="mt-4 sm:mt-2 md:mt-0 flex justify-start items-start sm:items-center flex-col sm:flex-row"
    >
      <slot name="actions" />
    </div>
  </div>
</template>
