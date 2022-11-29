import Vue from 'vue'

export interface ConfettiState {
  count: number
}

export interface ConfettiPlugin {
  state: ConfettiState
  activate: Function
}

export const state = Vue.observable({
  count: 0
})

const Plugin = (Vue: any, _: any) => {
  Vue.prototype.$confetti = {
    state,
    activate() {
      state.count++
    }
  } as ConfettiPlugin
}

Vue.use(Plugin)
