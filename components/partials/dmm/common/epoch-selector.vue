<template>
  <v-dropdown
    class="bg-gray-800 rounded-full w-4/5 lg:w-3/5 xl:w-2/5 max-w-xl mx-auto"
    selected-class="px-5 py-4"
    menu-class="border border-primary-500 rounded-2xl"
    hide-bottom-border
  >
    <template slot="title">
      <span>
        {{ $t('dmm.epoch.prefix') }} {{ selectedEpoch.text }}
        <span v-if="selectedEpoch.id === 1">({{ $t('dmm.epoch.current') }})</span>
      </span>
    </template>

    <div class="cursor-pointer">
      <VEpochItem
        v-for="(epoch, index) in epochs"
        :key="`epoch-${epoch.id}`"
        :active="index === 0"
        :item="epoch"
        @click="handleClick"
      >
        {{ epoch.text }}
      </VEpochItem>
    </div>
  </v-dropdown>
</template>

<script lang="ts">
import Vue from 'vue'
import VEpochItem from './epoch-item.vue'
import Dropdown from '~/components/elements/dropdown.vue'

export default Vue.extend({
  components: {
    VEpochItem,
    'v-dropdown': Dropdown
  },

  props: {
    selectedEpoch: {
      type: Object,
      required: true
    }
  },

  data() {
    return {
      epochs: [
        {
          id: 1,
          text: 'Oct 21 - Oct 30'
        },
        {
          id: 2,
          text: 'Oct 14 - Oct 21'
        },
        {
          id: 3,
          text: 'Oct 7 - Oct 13'
        },
        {
          id: 4,
          text: 'Sep 31 - Oct 06'
        },
        {
          id: 5,
          text: 'Sep 24 - Sep 30'
        },
        {
          id: 6,
          text: 'Sep 17 - Sep 23'
        },
        {
          id: 7,
          text: 'Sep 07 - Sep 16'
        }
      ]
    }
  },

  methods: {
    handleClick(item: any) {
      this.$emit('update:selected-epoch', item)
    }
  }
})
</script>
