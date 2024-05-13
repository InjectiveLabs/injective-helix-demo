<script lang="ts" setup>
defineProps({
  isDisabled: Boolean,

  page: {
    type: Number,
    required: true
  },

  limit: {
    type: Number,
    required: true
  },

  rowClass: {
    type: String,
    default: ''
  },

  totalCount: {
    type: Number,
    required: true
  }
})

const route = useRoute()
const router = useRouter()

async function updatePage(page: number) {
  await router.push({
    ...route,
    query: {
      ...route.query,
      page
    }
  })
}

async function updateLimit(limit: number) {
  await router.push({
    ...route,
    query: {
      ...route.query,
      limit
    }
  })
}
</script>

<template>
  <BasePaginationWrapper
    class="flex flex-wrap items-center justify-between text-sm w-full"
    v-bind="{
      page,
      limit,
      totalCount,
      isDisabled: isDisabled,
      ...$attrs
    }"
    @update:page="updatePage"
    @update:limit="updateLimit"
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
          <BaseSelectorItem
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
          </BaseSelectorItem>
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
  </BasePaginationWrapper>
</template>
