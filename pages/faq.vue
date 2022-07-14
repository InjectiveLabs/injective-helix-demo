<template>
  <div class="h-full w-full flex flex-wrap py-4">
    <div class="container">
      <div class="w-full mx-auto xl:w-4/5">
        <VPanel :title="$t('Frequently Asked Questions')">
          <div>
            <VTop
              :category="category"
              :search="search"
              @category-selected="handleCategorySelected"
              @searched="handleSearched"
            />
            <VFaq :category="category" :search="search" />
          </div>
        </VPanel>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import VTop from '~/components/partials/faq/top.vue'
import VFaq from '~/components/partials/faq/faq.vue'
import { FaqCategory } from '~/types/faq'

export default Vue.extend({
  components: {
    VTop,
    VFaq
  },

  data() {
    return {
      category: FaqCategory.All,
      search: ''
    }
  },

  methods: {
    handleCategorySelected(category: FaqCategory) {
      this.category = category
    },

    handleSearched(search: string) {
      this.search = search
    }
  }
})
</script>
