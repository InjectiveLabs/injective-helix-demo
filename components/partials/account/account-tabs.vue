<template>
  <TabMenu>
    <template #items>
      <nuxt-link
        v-for="tab in tabs"
        :key="tab.value"
        :to="{ name: 'account', query: { view: tab.url } }"
      >
        <TabMenuItem
          :value="tab.value"
          :active="value.value === tab.value"
          data-cy="account-tabs-balances-selector"
        >
          {{ $t(tab.label) }}
        </TabMenuItem>
      </nuxt-link>
    </template>
  </TabMenu>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'

import TabMenu from '~/components/elements/tab-menu.vue'
import TabMenuItem from '~/components/elements/tab-menu-item.vue'
import { TabOption } from '~/types'

export default Vue.extend({
  components: {
    TabMenu,
    TabMenuItem
  },

  props: {
    tabs: {
      type: Array as PropType<TabOption[]>,
      required: true
    },

    value: {
      type: Object as PropType<TabOption>,
      required: true
    }
  }
})
</script>
