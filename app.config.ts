export default defineAppConfig({
  ui: {
    primary: 'blue',
    gray: 'slate',

    modal: {
      background: 'dark:bg-brand-900',
      overlay: {
        background: 'dark:bg-black/50'
      }
    },

    card: {
      background: 'dark:bg-brand-900'
    },

    popover: {
      background: 'dark:bg-brand-900',
      ring: 'ring-coolGray-800'
    },

    notification: {
      background: 'dark:bg-brand-900'
    },

    tooltip: {
      base: '[@media(pointer:coarse)]:hidden px-2 py-1 text-xs h-auto font-normal relative overflow-auto text-wrap'
    },

    checkbox: {
      wrapper: 'items-center',
      inner: 'ms-2',
      base: 'dark:checked:bg-transparent dark:checked:border-white dark:disabled:bg-coolGray-500',
      rounded: 'rounded-none',
      border: 'dark:border-white',
      label: 'font-normal'
    },

    select: {
      color: {
        white: {
          outline:
            'shadow-sm dark:bg-brand-900 dark:text-white ring-1 ring-inset dark:ring-coolGray-700 focus:ring-2 dark:focus:ring-primary-400'
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
      }
    },
    table: {
      divide: 'dark:divide-coolGray-800',
      tbody: 'dark:divide-coolGray-800',
      th: {
        padding: 'p-4',
        color: 'dark:text-coolGray-400',
        font: 'font-normal',
        size: 'text-xs',
        base: 'dark:bg-[#141620]'
      },
      td: {
        padding: 'p-2',
        color: 'dark:text-white',
        size: 'text-xs'
      },
      default: {
        sortButton: {
          class:
            'p-0 dark:text-coolGray-500 text-xs font-normal dark:hover:bg-transparent [&>.iconify]:size-4'
        }
      }
    }
  }
})
