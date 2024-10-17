export default defineAppConfig({
  ui: {
    primary: 'blue',
    gray: 'zinc',

    popover: {
      background: 'bg-brand-900 dark:bg-brand-900'
    },

    tooltip: {
      base: '[@media(pointer:coarse)]:hidden px-2 py-1 text-xs h-auto font-normal relative overflow-auto text-wrap'
    }
  }
})
