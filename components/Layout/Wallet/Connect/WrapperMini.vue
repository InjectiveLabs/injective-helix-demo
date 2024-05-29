<template>
  <li
    class="flex flex-col items-center hover:bg-gray-800 rounded-md cursor-pointer p-2 py-4"
  >
    <slot name="logo" />
    <div class="mt-2 text-sm">
      <slot name="title" />
    </div>
  </li>
</template>
