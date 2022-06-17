<template>
  <div :class="classes" role="checkbox" tabindex="0" @click.stop="toggle">
    <span
      :class="allowance.gt(0) ? 'bg-primary-500' : 'bg-gray-500'"
      class="inline-block w-full h-full rounded-full shadow-md transition-bg-color"
    ></span>
    <span :class="indicatorClasses" :style="indicatorStyles">
      <v-ui-icon
        :icon="indicatorIcon"
        :rotating="status.isLoading()"
        :muted="status.isLoading()"
        :primary="!status.isLoading() && allowance.gt(0)"
        :red="!status.isLoading() && !allowance.gt(0)"
        :style="{ marginTop: lg ? '6px' : '-9px', marginRight: '2px' }"
        v-bind="{ '2xs': sm, sm: lg }"
      ></v-ui-icon>
    </span>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { BigNumberInWei, Status } from '@injectivelabs/utils'
import { TokenWithBalance } from '@injectivelabs/sdk-ui-ts'
import { Icon } from '~/types'

export default Vue.extend({
  props: {
    token: {
      required: true,
      type: Object as PropType<TokenWithBalance>
    },

    sm: {
      required: false,
      default: false,
      type: Boolean
    },

    lg: {
      required: false,
      default: false,
      type: Boolean
    }
  },

  data() {
    return {
      status: new Status()
    }
  },

  computed: {
    allowance(): BigNumberInWei {
      const { token } = this

      return new BigNumberInWei(token.allowance)
    },

    classes(): string {
      const classes = [
        'block',
        'overflow-hidden',
        'relative',
        'cursor-pointer',
        'outline-none',
        'focus:outline-none',
        'rounded-full',
        'shadow',
        'focus:shadow-lg',
        'ml-auto'
      ]

      if (this.status.isLoading()) {
        classes.push('opacity-75', 'pointer-events-none', 'cursor-not-allowed')
      }

      if (this.sm) {
        classes.push('w-14', 'h-6')
      } else if (this.lg) {
        classes.push('w-24', 'h-10')
      } else {
        classes.push('w-16', 'h-8')
      }

      return classes.join(' ')
    },

    indicatorClasses(): string {
      const classes = [
        'absolute',
        'icon-lock-unlock',
        'inset-0',
        'ml-1',
        'mt-1',
        'bg-white',
        'rounded-full',
        'shadow',
        'transition-transform'
      ]

      if (this.status.isLoading()) {
        classes.push('icon-rotating')
      }

      if (this.sm) {
        classes.push('w-5', 'h-5')
      } else if (this.lg) {
        classes.push('w-8', 'h-8')
      } else {
        classes.push('w-6', 'h-6')
      }

      return classes.join(' ')
    },

    indicatorIcon(): Icon {
      const { Sync, Unlocked, Locked } = Icon

      if (this.status.isLoading()) {
        return Sync
      }

      return new BigNumberInWei(this.allowance).gt(0) ? Unlocked : Locked
    },

    indicatorStyles(): { transform: string; marginTop: string } {
      const distance = this.sm ? '1.75rem' : '2rem'

      return {
        marginTop: this.sm ? '2px' : '',
        transform: new BigNumberInWei(this.allowance).gt(0)
          ? `translateX(${distance})`
          : 'translateX(0)'
      }
    }
  },

  methods: {
    toggle() {
      this.status.setLoading()

      this.$accessor.token
        .setTokenAllowance(this.token)
        .then(() => {
          this.status.setIdle()
          this.$toast.success(this.$t('token_allowance_successful'))
        })
        .catch(this.$onRejected)
    }
  }
})
</script>
