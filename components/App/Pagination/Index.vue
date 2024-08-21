<script lang="ts" setup>
withDefaults(
  defineProps<{
    isDisabled?: boolean
    page: number
    limit: number
    rowClass?: string
    totalCount: number
  }>(),
  {
    isDisabled: false,
    rowClass: ''
  }
)
</script>

<template>
  <SharedPaginationWrapper
    class="flex flex-wrap items-center justify-between text-sm w-full"
    v-bind="{
      page,
      limit,
      totalCount,
      isDisabled: isDisabled,
      ...$attrs
    }"
  >
    <template #summary="{ from, to }">
      <span>
        {{
          $t('pagination.paginationPages', { from, to, totalCount: totalCount })
        }}
      </span>
    </template>

    <template
      #default="{
        hasPrevPage,
        hasNextPage,
        onClickEvent,
        onNextEvent,
        onPrevEvent,
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
          @click="onPrevEvent"
        >
          <SharedIcon name="caret-thin" class="h-auto w-3" />
        </span>

        <div class="mx-3 flex items-center gap-0.5 text-sm font-semibold">
          <SharedSelectorItem
            v-for="(displayPage, index) in pagesToDisplay"
            :key="`pagination-page-${displayPage}-${index}`"
            :model-value="page"
            :value="displayPage"
            class="cursor-pointer"
            @update:model-value="onClickEvent"
          >
            <template #default="{ isActive }">
              <span
                class="px-2 py-1 hover:bg-blue-500 hover:bg-opacity-80 hover:text-blue-800"
                :class="{
                  'bg-blue-500 text-blue-800': isActive
                }"
              >
                {{ displayPage }}
              </span>
            </template>
          </SharedSelectorItem>
        </div>

        <span
          v-if="hasNextPage"
          :class="
            hasNextPage ? 'cursor-pointer text-blue-500' : 'text-gray-600'
          "
          @click="onNextEvent"
        >
          <SharedIcon name="caret-thin" class="h-auto w-3 -rotate-180" />
        </span>
      </div>
    </template>

    <template #row-select="{ rowOptions, onUpdateLimit }">
      <div class="flex items-center gap-2">
        <slot name="rows-prefix" />

        <AppPaginationRowSelector
          :disabled="isDisabled"
          :limit="limit"
          :options="rowOptions"
          :selected-class="rowClass"
          @update:model-value="onUpdateLimit"
        />
      </div>
    </template>
  </SharedPaginationWrapper>
</template>
