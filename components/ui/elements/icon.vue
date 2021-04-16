<template>
  <component
    :is="`v-icon-${icon}`"
    v-tooltip="{
      content: tooltip
    }"
    :class="classes"
    :style="styles"
    v-on="$listeners"
  />
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { Icon } from '~/types'

export default Vue.extend({
  props: {
    icon: {
      required: true,
      type: String as PropType<Icon>
    },

    '2xs': {
      required: false,
      default: false,
      type: Boolean
    },

    tooltip: {
      required: false,
      default: '',
      type: String
    },

    rotate: {
      required: false,
      default: false,
      type: Boolean
    },

    pointer: {
      required: false,
      default: false,
      type: Boolean
    },

    rotating: {
      required: false,
      default: false,
      type: Boolean
    },

    xs: {
      required: false,
      default: false,
      type: Boolean
    },

    sm: {
      required: false,
      default: false,
      type: Boolean
    },

    md: {
      required: false,
      default: false,
      type: Boolean
    },

    lg: {
      required: false,
      default: false,
      type: Boolean
    },

    xl: {
      required: false,
      default: false,
      type: Boolean
    },

    primary: {
      required: false,
      default: false,
      type: Boolean
    },

    muted: {
      required: false,
      default: false,
      type: Boolean
    },

    accent: {
      required: false,
      default: false,
      type: Boolean
    },

    strokeOnly: {
      required: false,
      default: false,
      type: Boolean
    }
  },

  computed: {
    styles(): any {
      if (this.rotate) {
        return {
          transform: 'rotate(180deg)',
          margin: '0 !important'
        }
      }

      if (this.rotating) {
        return {
          animation: 'rotation 2s infinite linear'
        }
      }

      return {}
    },

    classes(): string {
      const classes = ['inline']

      if (this.strokeOnly) {
        classes.push('stroke-current')
      } else {
        classes.push('fill-current')
      }

      if (this.md) {
        classes.push('w-6', 'h-6')
      }

      if (this.xl) {
        classes.push('w-16', 'h-16')
      }

      if (this.lg) {
        classes.push('w-10', 'h-10')
      }

      if (this.sm) {
        classes.push('w-5', 'h-5')
      }

      if (this.xs) {
        classes.push('w-4', 'h-4')
      }

      if (this['2xs']) {
        classes.push('w-3', 'h-3')
      }

      if (this.pointer) {
        classes.push('cursor-pointer')
      }

      const hasSizeClass = classes.find((className) => {
        return className.startsWith('w-') || className.startsWith('h-')
      })

      if (!hasSizeClass) {
        classes.push('w-6', 'h-6')
      }

      if (this.primary) {
        classes.push('text-primary-500')

        if (this.pointer) {
          classes.push('hover:text-primary-600')
        }
      }

      if (this.accent) {
        classes.push('text-accent-500')

        if (this.pointer) {
          classes.push('hover:text-accent-600')
        }
      }

      if (this.muted) {
        classes.push('text-gray-500')
      }

      return classes.join(' ')
    }
  }
})
</script>
