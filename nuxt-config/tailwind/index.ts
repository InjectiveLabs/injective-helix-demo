/**
 * Required to separate from the tailwind.config.ts
 * file because we import the colors in the trading view
 * component and it can't be compiled because
 * there is a require() in the tailwind.config.ts
 * which can't be compiled using Vite
 */
export const colors = {
  coolGray: {
    100: '#F8F8F8',
    200: '#F2F2F2',
    300: '#D9DADC',
    350: '#D0D0D1',
    375: '#C3C3C3',
    400: '#a6a8ad',
    450: '#A1A1A3',
    475: '#727376',
    500: '#717584',
    600: '#434858',
    650: '#434448',
    700: '#2A2F41',
    750: '#202431',
    775: '#282C39',
    800: '#1d2130',
    825: '#212121',
    850: '#191c27',
    900: '#14161F',
    925: '#14151A',
    950: '#14151A'
  },

  blue: {
    50: '#E8F3FD',
    100: '#D5EAFB',
    200: '#A7D2F6',
    300: '#7DBDF2',
    400: '#54A8ED',
    450: '#3399EC',
    500: '#2891E9',
    550: '#0082FA',
    600: '#1477C7',
    700: '#0F5894',
    800: '#0A3A61',
    900: '#051E33'
  },

  orange: {
    200: '#F1D18E',
    300: '#FFBC32',
    400: '#F3A400',
    500: '#F7931A'
  },

  red: {
    50: '#FEE7EC',
    100: '#FDCEDA',
    200: '#FAA3B9',
    300: '#F87294',
    400: '#F64772',
    500: '#F3164D',
    600: '#CC0A3B',
    700: '#96082B',
    800: '#66051D',
    900: '#31020E'
  },

  green: {
    50: '#E7FEF6',
    100: '#CAFCEB',
    200: '#9AF9D9',
    300: '#65F5C5',
    400: '#35F2B3',
    450: '#0FE824',
    500: '#0EE29B',
    600: '#0BB67D',
    700: '#08865C',
    800: '#065B3F',
    900: '#032B1E'
  },

  primary: {
    400: '#00D3FB',
    500: '#00F2FE'
  },

  brand: {
    700: '#2D4457',
    725: '#2A2E39',
    750: '#212538',
    800: '#202431',
    825: '#181A25',
    850: '#1B1D29',
    875: '#1A1D24',
    900: '#14151A'
  },

  'azure-blue': {
    '50': '#edfbff',
    '100': '#d6f4ff',
    '200': '#b5edff',
    '300': '#83e4ff',
    '400': '#48d2ff',
    '500': '#1eb5ff',
    '600': '#0698ff',
    '700': '#0082fa',
    '800': '#0865c5',
    '900': '#0d579b',
    '950': '#0e345d'
  }
}
