export default defineAppConfig({
  ui: {
    primary: 'blue',
    gray: 'slate',

    modal: {
      wrapper: 'relative z-[99]',
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
      wrapper: 'inline-flex',
      ring: 'ring-coolGray-800',
      background: 'dark:bg-brand-900'
    },

    dropdown: {
      background: 'dark:bg-coolGray-875',
      ring: 'ring-0',
      padding: 'p-3'
    },

    tooltip: {
      background: 'dark:bg-coolGray-900',
      base: '[@media(pointer:coarse)]:hidden px-2 py-1 text-xs h-auto font-normal relative overflow-auto text-wrap',
      width: 'w-full max-w-xs'
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
      wrapper: 'h-full overflow-auto',
      tbody: 'dark:divide-coolGray-800',
      divide: 'dark:divide-coolGray-800',
      base: 'border-b border-coolGray-800',
      thead:
        'dark:bg-brand-900 sticky top-0 z-[1] after:absolute after:bottom-0 after:w-full after:h-[1px] after:bg-coolGray-800',
      th: {
        padding: 'p-4',
        size: 'text-xs',
        font: 'font-normal',
        base: 'whitespace-nowrap',
        color: 'dark:text-coolGray-400'
      },
      td: {
        padding: 'p-2',
        size: 'text-xs',
        color: 'dark:text-slate-50'
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
