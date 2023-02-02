<script lang="ts" setup>
defineProps({
  disabled: Boolean,

  limit: {
    type: Number,
    required: true
  },

  page: {
    type: Number,
    required: true
  },

  totalCount: {
    type: Number,
    required: true
  },

  rowClass: {
    type: String,
    default: ''
  }
})
</script>

<template>
  <BasePaginationWrapper
    v-bind="$attrs"
    class="flex flex-wrap items-center justify-between text-sm w-full"
    :disabled="disabled"
    :page="page"
    :limit="limit"
    :total-count="totalCount"
  >
    <template #summary="{ from, to }">
      <span>From {{ from }} to {{ to }} total {{ totalCount }}</span>
    </template>

    <template
      #default="{
        hasPrevPage,
        hasNextPage,
        handleClickEvent,
        handleNextEvent,
        handlePrevEvent,
        pagesToDisplay
      }"
    >
      <div
        class="text-2xs tracking-1.5 flex items-center justify-center text-center"
      >
        <span
          v-if="hasPrevPage"
          :class="
            hasPrevPage ? 'cursor-pointer text-blue-500' : 'text-gray-600'
          "
          @click="handlePrevEvent"
        >
          <BaseIcon name="caret-thin" class="h-auto w-3" />
        </span>

        <div class="mx-3 flex items-center gap-0.5 text-sm font-semibold">
          <BaseSelectorItem
            v-for="(displayPage, index) in pagesToDisplay"
            :key="`pagination-page-${displayPage}-${index}`"
            :model-value="page"
            :value="displayPage"
            class="cursor-pointer"
            @update:model-value="handleClickEvent"
          >
            <template #default="{ active }">
              <span
                class="px-2 py-1 hover:bg-blue-500 hover:bg-opacity-80 hover:text-blue-800"
                :class="{ 'bg-blue-500 text-blue-800': active }"
              >
                {{ displayPage }}
              </span>
            </template>
          </BaseSelectorItem>
        </div>

        <span
          v-if="hasNextPage"
          :class="
            hasNextPage ? 'cursor-pointer text-blue-500' : 'text-gray-600'
          "
          @click="handleNextEvent"
        >
          <BaseIcon name="caret-thin" class="h-auto w-3 -rotate-180" />
        </span>
      </div>
    </template>

    <template #row-select="{ rowOptions, handleUpdateLimit }">
      <div class="flex items-center gap-2">
        <slot name="rows-prefix" />

        <AppPaginationRowSelector
          :disabled="disabled"
          :limit="limit"
          :options="rowOptions"
          :selected-class="rowClass"
          @update:model-value="handleUpdateLimit"
        />
      </div>
    </template>
  </BasePaginationWrapper>
</template>
