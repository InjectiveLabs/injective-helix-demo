<template>
  <span>
    {{ $t('pagination.showCountOutOfTotal', { from, to, totalCount }) }}
  </span>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  components: {},

  props: {
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
    }
  },

  computed: {
    from(): number {
      const { limit, page } = this
      return page * limit - limit + 1
    },

    to(): number {
      const { totalCount, limit, page } = this
      const maxCountOnPage = limit * page
      return maxCountOnPage > totalCount ? totalCount : maxCountOnPage
    }
  }
})
</script>
