<template>
  <li>
    <div
      class="
        block
        bg-dark-600
        hover:bg-dark-800
        border
        rounded-lg
        cursor-pointer
      "
    >
      <div class="flex items-center p-2">
        <div class="min-w-0 flex-1 flex items-center">
          <div
            class="
              min-w-0
              flex-1
              px-4
              md:grid md:grid-cols-1
              md:gap-4
              text-left
            "
          >
            <div>
              <!-- eslint-disable vue/no-v-html -->
              <p
                class="text-sm text-gray-400"
                v-html="$t('disclaimer_note')"
              ></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </li>
</template>
