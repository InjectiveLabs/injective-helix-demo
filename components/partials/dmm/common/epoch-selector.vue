<template>
  <v-dropdown
    v-if="activeEpochId"
    class="bg-gray-800 rounded-full w-4/5 lg:w-3/5 xl:w-2/5 max-w-xl mx-auto"
    selected-class="px-3 py-2 xs:px-4 xs:py-3 md:px-5 md:py-4"
    menu-class="border border-primary-500 rounded-2xl"
    hide-bottom-border
    :disabled="disabled"
  >
    <template slot="title">
      <span>
        {{ $t('dmm.epoch.prefix') }} {{ selectedEpoch.text }}
        <span v-if="selectedEpoch.id === latestEpochId">
          ({{ $t('dmm.epoch.current') }})
        </span>
      </span>
    </template>

    <div class="cursor-pointer">
      <VEpochItem
        v-for="(epoch, index) in formattedEpochs"
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
import { format } from 'date-fns'
import VEpochItem from './epoch-item.vue'
import Dropdown from '~/components/elements/dropdown.vue'
import { UiEpochDate } from '~/types'

export default Vue.extend({
  components: {
    VEpochItem,
    'v-dropdown': Dropdown
  },
  props: {
    disabled: {
      type: Boolean,
      default: false
    }
  },

  computed: {
    activeEpochId(): string {
      return this.$accessor.dmm.activeEpochId
    },

    epochDates(): UiEpochDate[] {
      return this.$accessor.dmm.dates
    },

    formattedEpochs(): Record<string, any>[] {
      const { epochDates } = this

      return epochDates.map((epochDate) => {
        return {
          id: epochDate.id,
          text: `${format(new Date(epochDate.startTime), 'dd MMM')} - ${format(
            new Date(epochDate.endTime),
            "dd MMM 'UTC 'xxx"
          )}`
        }
      })
    },

    latestEpochId(): string {
      const { epochDates } = this

      if (epochDates.length > 0) {
        return epochDates[0].id
      }

      return ''
    },

    selectedEpoch(): Record<string, any> {
      const { activeEpochId, formattedEpochs } = this

      return formattedEpochs.find(({ id }) => {
        return id === activeEpochId
      }) as Record<string, any>
    }
  },

  methods: {
    format,
    handleClick(item: any) {
      this.$emit('update', item.id)
    }
  }
})
</script>
