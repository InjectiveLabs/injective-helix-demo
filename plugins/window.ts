import Vue from 'vue'

export interface WindowState {
  width: number
}

export interface WindowPlugin {
  state: WindowState
}

export const state = Vue.observable({
  width: 0
})

const Plugin = (Vue: any, _: any) => {
  state.width = window.innerWidth

  window.addEventListener('resize', () => {
    state.width = window.innerWidth
  })

  Vue.prototype.$window = {
    state
  } as WindowPlugin
}

Vue.use(Plugin)
