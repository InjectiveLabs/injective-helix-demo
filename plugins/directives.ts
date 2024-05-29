export default defineNuxtPlugin(({ vueApp }) => {
  vueApp.directive('focus', {
    mounted(el) {
      el.focus()
    }
  })
})
