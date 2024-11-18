export default defineAppConfig({
  ui: {
    primary: 'blue',
    gray: 'slate',

    card: {
      background: 'dark:bg-brand-875'
    },

    modal: {
      overlay: {
        background: 'dark:bg-brand-900/80'
      }
    },

    popover: {
      background: 'bg-brand-900 dark:bg-brand-900'
    },

    notification: {
      background: 'bg-brand-900 dark:bg-brand-900'
    },

    tooltip: {
      base: '[@media(pointer:coarse)]:hidden px-2 py-1 text-xs h-auto font-normal relative overflow-auto text-wrap',
      width: 'w-full max-w-[200px]'
    },

    checkbox: {
      wrapper: 'items-center',
      inner: 'ms-2',
      base: 'dark:checked:bg-transparent dark:checked:border-white dark:disabled:bg-coolGray-500',
      rounded: 'rounded-none',
      border: 'border-white dark:border-white',
      label: 'font-normal'
    },

    select: {
      color: {
        white: {
          outline:
            'shadow-sm bg-white dark:bg-brand-900 text-coolGray-900 dark:text-white ring-1 ring-inset ring-coolGray-300 dark:ring-coolGray-700 focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400'
        }
      }
    },

    tabs: {
      list: {
        background: 'dark:bg-transparent',
        padding: 'pb-0',
        rounded: 'rounded-none',
        marker: {
          background:
            'dark:bg-transparent translate-y-px border-b border-blue-500',
          rounded: 'rounded-none'
        },
        tab: {
          active: 'dark:text-primary-500'
        }
      }
    },

    selectMenu: {
      background: 'dark:bg-brand-900',

      option: {
        active: 'dark:bg-brand-800',
        selectedIcon: {
          base: 'w-4 h-4'
        }
      },
      input: 'dark:bg-brand-900'
    }
  }
})
