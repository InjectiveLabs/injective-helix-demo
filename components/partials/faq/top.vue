<template>
  <div class="">
    <div class="text-center">
      <div class="flex flex-wrap justify-center">
        <VButtonFilter
          :component="category"
          :option="FaqCategory.All"
          @select="handleSelectCategoryItem"
        >
          <span>
            {{ $t(`faq-category-${FaqCategory.All}`) }}
          </span>
        </VButtonFilter>
        <VSeparator />
        <VButtonFilter
          :component="category"
          :option="FaqCategory.General"
          @select="handleSelectCategoryItem"
        >
          <span>
            {{ $t(`faq-category-${FaqCategory.General}`) }}
          </span>
        </VButtonFilter>
      </div>
    </div>
    <div>
      <VSearch
        name="search"
        class="max-w-sm mx-auto lg:max-w-none"
        :placeholder="$t('Search for FAQs')"
        :search="search"
        @searched="handleInputOnSearch"
      />
    </div>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import VSearch from '~/components/elements/search.vue'
import { FaqCategory } from '~/types/faq'

export default Vue.extend({
  components: {
    VSearch
  },

  props: {
    category: {
      required: true,
      type: String as PropType<FaqCategory>
    },

    search: {
      required: true,
      type: String
    }
  },

  data() {
    return {
      FaqCategory
    }
  },

  methods: {
    handleSelectCategoryItem(status: FaqCategory) {
      this.$emit('category-selected', status)
    },

    handleInputOnSearch(search: string) {
      this.$emit('searched', search)
    }
  }
})
</script>
