<template>
  <v-card>
    <div>
      <div>
        <p class="uppercase text-xs text-gray-400">
          <slot name="category" />
        </p>
      </div>
      <div>
        <h3 class="font-semibold text-lg text-gray-100">
          <slot name="title" />
        </h3>
      </div>
      <p class="text-gray-400 tracking-tight text-xs mt-2 w-full lg:w-3/4">
        <slot></slot>
      </p>
      <div class="mt-6 text-xs">
        <slot name="link" />
      </div>
    </div>
  </v-card>
</template>
