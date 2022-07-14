<template>
  <div
    :ref="uid"
    v-click-outside="onClickOutside"
    @mouseleave="onMouseLeave"
    @mouseenter="showDropdown"
  >
    <div v-if="!hideArrow" class="arrow" data-popper-arrow />
    <slot></slot>
  </div>
</template>
<script lang="ts">
import Vue from 'vue'
import { createPopper, Instance } from '@popperjs/core'

export default Vue.extend({
  props: {
    bindingElement: {
      type: String,
      required: true
    },

    options: {
      type: Object,
      required: false,
      default: () => ({
        placement: 'bottom',
        modifiers: [
          {
            name: 'offset',
            options: {
              offset: [0, 8]
            }
          }
        ]
      })
    },

    hideArrow: {
      type: Boolean,
      default: false
    }
  },

  data() {
    return {
      popper: {} as Instance,
      delayHide: null as any,
      active: false
    }
  },

  computed: {
    uid(): string {
      return window.crypto.getRandomValues(new Uint32Array(1))[0].toString()
    },

    $popperElement(): InstanceType<typeof HTMLElement> {
      const { uid } = this

      return this.$refs[uid] as InstanceType<typeof HTMLElement>
    }
  },

  mounted() {
    const bindingElement = document.querySelector(this.bindingElement)

    if (bindingElement) {
      this.popper = createPopper(
        bindingElement,
        this.$popperElement,
        this.options
      )
    }
  },

  methods: {
    onClickOutside() {
      if (!this.$popperElement || !this.active) {
        return
      }
      this.$emit('close')
    },

    showDropdown() {
      const { $popperElement } = this

      clearTimeout(this.delayHide)

      this.$nextTick(() => {
        if (this.popper) {
          this.popper.update()
        }

        this.active = true
        $popperElement.setAttribute('data-show', '')
      })
    },

    hideDropdown() {
      // prevents hiding popper when moving from binding element to popper element
      this.delayHide = setTimeout(this.hide, 100)
    },

    onMouseLeave() {
      if (this.$listeners && this.$listeners.close) {
        return
      }

      this.hideDropdown()
    },

    hide() {
      this.active = false
      this.$popperElement.removeAttribute('data-show')
    }
  }
})
</script>
