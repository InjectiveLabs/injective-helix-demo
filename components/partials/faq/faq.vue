<template>
  <div>
    <dl class="mt-6 space-y-6 divide-y divide-gray-700">
      <VAccordion
        v-for="(panel, index) in filteredFaqs"
        :key="`faq-${index}`"
        :is-open="openPanelIndex === index"
        @togglePanel="handleTogglePanel(index)"
      >
        <div slot="title">
          {{ $t(`${panel.type} title`) }}
        </div>
        <div v-if="panel.new" slot="badge" class="ml-2 -mt-px">
          <v-badge xs primary> New </v-badge>
        </div>

        <i18n :path="`${panel.type} content`" tag="p">
          <template v-if="panel.link" #action>
            <a :href="panel.link" class="text-primary-500" target="_blank">
              {{ $t(`${panel.type} link`) }}
            </a>
          </template>

          <template v-if="panel.link2" #action2>
            <a :href="panel.link2" class="text-primary-500" target="_blank">
              {{ $t(`${panel.type} link2`) }}
            </a>
          </template>
        </i18n>
      </VAccordion>
    </dl>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import VAccordion from '~/components/elements/accordion.vue'
import { Faq, FaqCategory } from '~/types/faq'

export default Vue.extend({
  components: {
    VAccordion
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
      openPanelIndex: 0
    }
  },

  computed: {
    faqs(): Faq[] {
      return [
        {
          type: 'seek assistance',
          link: 'https://discord.gg/injective',
          new: false,
          category: [FaqCategory.All, FaqCategory.General]
        }
      ]
    },

    i18n(): Record<string, any> {
      // @ts-ignore
      const { _i18n } = this

      return _i18n
    },

    filteredFaqs(): Faq[] {
      const { faqs, category, search, i18n } = this

      return faqs.filter((faq) => {
        return (
          faq.category.includes(category) &&
          (i18n
            .t(`${faq.type} title`)
            .toLowerCase()
            .includes(search.toLowerCase()) ||
            i18n
              .t(`${faq.type} content`)
              .toLowerCase()
              .includes(search.toLowerCase()))
        )
      })
    }
  },

  methods: {
    handleClickShowMore() {
      this.$emit('show-more')
    },

    handleTogglePanel(index: number) {
      this.openPanelIndex = index
    }
  }
})
</script>
