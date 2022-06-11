import Vue from 'vue'

const directive = {
  bind(el: Element, { value }: any) {
    window.addEventListener('mouseup', (e) => directive.onMouseUp(e, el, value))
  },

  unbind(el: Element) {
    window.removeEventListener('mouseup', (e) => directive.onMouseUp(e, el))
  },

  onMouseUp(e: MouseEvent, el: Element, callback?: Function) {
    const rect = el.getBoundingClientRect()
    if (!this.withinRect(e, rect)) {
      callback && callback()
    }
  },

  update(el: Element, { value, oldValue }: any) {
    if (JSON.stringify(value) === JSON.stringify(oldValue)) {
      return
    }
    directive.unbind(el)
    directive.bind(el, { value })
  },

  withinRect(mouse: MouseEvent, rect: DOMRect) {
    return (
      mouse.clientX > rect.left &&
      mouse.clientX < rect.right &&
      mouse.clientY > rect.top &&
      mouse.clientY < rect.bottom
    )
  }
}

const ClickOutsidePlugin = {
  install(Vue: any) {
    Vue.directive('click-outside', directive)
  },

  directive
}

Vue.use(ClickOutsidePlugin)
