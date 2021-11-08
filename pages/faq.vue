<template>
  <div class="h-full w-full flex flex-wrap py-4">
    <div class="container">
      <div class="w-full mx-auto xl:w-4/5">
        <v-panel :title="$t('Frequently Asked Questions')">
          <div>
            <v-top
              :category="category"
              :search="search"
              @category-selected="handleCategorySelected"
              @searched="handleSearched"
            />
            <v-faq :category="category" :search="search" />
          </div>
        </v-panel>
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
