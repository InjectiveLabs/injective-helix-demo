<template>
  <VCard md>
    <div class="relative h-full">
      <div class="flex flex-col flex-wrap h-full">
        <div v-if="false" class="w-full">
          <p class="uppercase text-2xs text-gray-500">
            <slot name="category" />
          </p>
        </div>
        <div class="w-full">
          <h3 class="font-semibold text-lg text-gray-100">
            <slot name="title" />
          </h3>
        </div>
        <p class="text-gray-300 tracking-tight text-base my-2 w-3/5 3xl:w-2/3">
          <slot></slot>
        </p>
        <div class="mt-auto text-base font-semibold">
          <slot name="link" />
        </div>
      </div>
      <div class="absolute right-0 top-0">
        <slot name="illustration"></slot>
      </div>
    </div>
  </VCard>
</template>
