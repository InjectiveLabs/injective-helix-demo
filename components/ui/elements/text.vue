<template>
  <component :is="tag" :class="classes" v-on="$listeners">
    <slot></slot>
  </component>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  props: {
    tag: {
      required: false,
      type: String,
      default: 'span'
    },

    uppercase: {
      required: false,
      type: Boolean,
      default: false
    },

    emp: {
      required: false,
      type: Boolean,
      default: false
    },

    semibold: {
      required: false,
      type: Boolean,
      default: false
    },

    primary: {
      required: false,
      type: Boolean,
      default: false
    },

    accent: {
      required: false,
      type: Boolean,
      default: false
    },

    warning: {
      required: false,
      type: Boolean,
      default: false
    },

    bold: {
      required: false,
      type: Boolean,
      default: false
    },

    '2xs': {
      required: false,
      type: Boolean,
      default: false
    },

    xs: {
      required: false,
      type: Boolean,
      default: false
    },

    sm: {
      required: false,
      type: Boolean,
      default: false
    },

    md: {
      required: false,
      type: Boolean,
      default: false
    },

    lg: {
      required: false,
      type: Boolean,
      default: false
    },

    xl: {
      required: false,
      type: Boolean,
      default: false
    },

    muted: {
      required: false,
      type: Boolean,
      default: false
    },

    mutedSm: {
      required: false,
      type: Boolean,
      default: false
    },

    mutedMd: {
      required: false,
      type: Boolean,
      default: false
    },

    mutedLg: {
      required: false,
      type: Boolean,
      default: false
    },

    mutedEmp: {
      required: false,
      type: Boolean,
      default: false
    }
  },

  computed: {
    classes(): string {
      const classes = []

      if (this.mutedSm) {
        classes.push('text-gray-400')
      } else if (this.mutedMd) {
        classes.push('text-gray-300')
      } else if (this.mutedEmp || this.mutedLg) {
        classes.push('text-gray-600')
      } else if (this.muted) {
        classes.push('text-gray-500')
      }

      if (this.emp) {
        classes.push('text-white', 'font-bold')
      }

      if (this.semibold) {
        classes.push('font-semibold')
      }

      if (this.bold) {
        classes.push('font-bold')
      }

      if (this.uppercase) {
        classes.push('uppercase')
      }

      if (this.primary) {
        classes.push('text-primary-500')
      } else if (this.accent) {
        classes.push('text-accent-500')
      } else if (this.warning) {
        classes.push('text-gray-300')
      }

      if (this['2xs']) {
        classes.push('text-2xs')
      } else if (this.xs) {
        classes.push('text-xs')
      } else if (this.sm) {
        classes.push('text-sm')
      } else if (this.md) {
        classes.push('text-md')
      } else if (this.lg) {
        classes.push('text-lg')
      } else if (this.xl) {
        classes.push('text-xl')
      }

      return classes.join(' ')
    }
  }
})
</script>
