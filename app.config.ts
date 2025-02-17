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
      ring: 'dark:ring-coolGray-800',
      background: 'dark:bg-brand-900'
    },

    popover: {
      background: 'dark:bg-brand-900',
      ring: 'ring-coolGray-800'
    },

    dropdown: {
      background: 'dark:bg-coolGray-875',
      ring: 'ring-0',
      padding: 'p-3'
    },

    notification: {
      background: 'dark:bg-brand-900'
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

    tabs: {
      list: {
        background: 'dark:bg-transparent',
        padding: 'pb-0',
        rounded: 'rounded-none',
        marker: {
          background:
            'dark:bg-transparent translate-y-px border-b border-primary-500',
          rounded: 'rounded-none'
        },
        tab: {
          active: 'dark:text-primary-500'
        }
      }
    },

    selectMenu: {
      trigger: '[&>button]:cursor-pointer',
      background: 'dark:bg-brand-900',

      option: {
        base: 'cursor-pointer',
        active: 'dark:bg-brand-800',
        selectedIcon: {
          base: 'w-4 h-4'
        }
      },
      input: 'dark:bg-brand-900'
    },

    skeleton: {
      background: 'dark:bg-brand-800'
    },

    table: {
      base: 'border-b border-coolGray-800',
      divide: 'dark:divide-coolGray-800',
      tbody: 'dark:divide-coolGray-800',
      th: {
        base: 'whitespace-nowrap',
        padding: 'p-4',
        color: 'dark:text-coolGray-400',
        font: 'font-normal',
        size: 'text-xs'
      },
      td: {
        padding: 'p-2',
        color: 'dark:text-slate-50',
        size: 'text-xs'
      },
      default: {
        sortButton: {
          class:
            'p-0 dark:text-coolGray-450 text-xs font-normal dark:hover:bg-transparent [&>.iconify]:size-4'
        }
      }
    }
  }
})
