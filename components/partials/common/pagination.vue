<template>
  <div class="text-sm flex justify-between items-center flex-wrap">
    <PaginationDetails
      class="order-last md:order-none"
      v-bind="{ limit, page, totalCount }"
    />

    <div
      class="text-center text-2xs flex items-center justify-center tracking-1.5 order-first w-full mb-4 md:mb-0 md:w-auto md:order-none"
    >
      <span
        class="uppercase"
        :class="hasPrevPage ? 'cursor-pointer text-white' : 'text-white text-opacity-50'"
        @click="handlePrevEvent"
      >
        <IconCaretThin class="w-3 h-auto" />
      </span>

      <div class="mx-3 flex items-center text-sm font-semibold gap-0.5">
        <PaginationPage
          v-for="(displayPage, index) in pagesToDisplay"
          :key="`pagination-page-${displayPage}-${index}`"
          :active="displayPage === page"
          :page="displayPage"
          @click="handleClickEvent"
        />
      </div>

      <span
        class="uppercase"
        :class="hasNextPage ? 'cursor-pointer text-white' : 'text-white text-opacity-50'"
        @click="handleNextEvent"
      >
        <IconCaretThin class="w-3 h-auto -rotate-180" />
      </span>
    </div>

    <RowSelect
      :limit="limit"
      :extra-limit-options="extraLimitOptions"
      @update:limit="handleUpdateLimit"
    />
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import PaginationPage from './pagination/pagination-page.vue'
import PaginationDetails from './pagination/pagination-details.vue'
import RowSelect from './pagination/rows-select.vue'

export default Vue.extend({
  components: {
    PaginationDetails,
    PaginationPage,
    RowSelect
  },

  props: {
    limit: {
      type: Number,
      required: true
    },

    disabled: {
      type: Boolean,
      default: false
    },

    extraLimitOptions: {
      type: Array as PropType<number[]>,
      default: () => []
    },

    page: {
      type: Number,
      required: true
    },

    totalPages: {
      type: Number,
      required: true
    },

    totalCount: {
      type: Number,
      required: true
    }
  },

  computed: {
    hasPrevPage(): boolean {
      const { page } = this

      return page > 1
    },

    hasNextPage(): boolean {
      const { page, totalPages } = this

      return page !== totalPages
    },

    pagesToDisplay(): Array<string | number> {
      const { page, totalPages } = this
      const middlePagesToDisplay = [] as Array<string | number>

      if (totalPages <= 7) {
        return [...Array(totalPages + 1).keys()].splice(1)
      }

      if (page < 4) {
        middlePagesToDisplay.push(2, 3, 4, 5, '...')
      } else if (totalPages - 3 <= page) {
        middlePagesToDisplay.push(
          '...',
          totalPages - 4,
          totalPages - 3,
          totalPages - 2,
          totalPages - 1
        )
      } else {
        middlePagesToDisplay.push('...', page - 1, page, page + 1, '...')
      }

      return [1, ...middlePagesToDisplay, totalPages]
    }
  },

  methods: {
    handleClickEvent(page: number) {
      const { disabled } = this

      if (!disabled) {
        this.$emit('update:page', page)
      }
    },

    handleNextEvent() {
      const { disabled, page, hasNextPage } = this

      if (!disabled && hasNextPage) {
        this.$emit('update:page', page + 1)
      }
    },

    handlePrevEvent() {
      const { disabled, page, hasPrevPage } = this

      if (!disabled && hasPrevPage) {
        this.$emit('update:page', page - 1)
      }
    },

    handleUpdateLimit(limit: number) {
      this.$emit('update:limit', limit)
    }
  }
})
</script>
