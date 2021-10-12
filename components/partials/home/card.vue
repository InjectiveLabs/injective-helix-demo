<template>
  <v-card>
    <div class="flex flex-col flex-wrap h-full">
      <div class="w-full">
        <p class="uppercase text-2xs text-gray-500">
          <slot name="category" />
        </p>
      </div>
      <div class="w-full">
        <h3 class="font-semibold text-lg text-gray-100">
          <slot name="title" />
        </h3>
      </div>
      <p class="text-gray-400 tracking-tight text-xs my-2 w-full lg:w-3/4">
        <slot></slot>
      </p>
      <div class="mt-auto text-xs font-semibold">
        <slot name="link" />
      </div>
    </div>
  </v-card>
</template>
