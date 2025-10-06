import Usd from './Usd.vue'
import { it, expect, describe } from 'vitest'
import { BigNumber } from '@injectivelabs/utils'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { DEFAULT_ABBREVIATION_THRESHOLD } from '../../utils/constant/index'

describe('Amount/Usd.vue', () => {
  describe('default behavior', () => {
    const testCases = [
      { input: '0.0000001', output: '$<0.01' },
      { input: '-0.0000001', output: '-$<0.01' },
      { input: '0.01100000', output: '$0.01' },
      { input: '1234.12345678', output: '$1,234.12' },
      { input: '1.01', output: '$1.01' },
      { input: '1.1', output: '$1.10' },
      { input: '1000000000.123', output: '$≈1B' },
      { input: '1234.1200000005253', output: '$1,234.12' },
      { input: '1.00030004', output: '$1.00' },
      { input: '1234.1234565253', output: '$1,234.12' },
      { input: '1234567', output: '$≈1.2M' },
      { input: '0.000000000001', output: '$<0.01' },
      { input: '0.000000000001234', output: '$<0.01' },
      { input: '1.000000000001234', output: '$1.00' },
      { input: '1.00001234', output: '$1.00' }
    ]

    it.each(testCases)(
      'formats $input to $output by default',
      async ({ input, output }) => {
        const component = await mountSuspended(Usd, {
          props: {
            amount: input
          },
          slots: {
            prefix: () => '$'
          }
        })
        expect(component.text()).toBe(output)
      }
    )
  })

  describe('abbreviation behavior', () => {
    it('abbreviates large numbers by default', async () => {
      const component = await mountSuspended(Usd, {
        props: {
          amount: '2000001'
        },
        slots: {
          prefix: () => '$'
        }
      })

      expect(component.text()).toBe('$≈2M')
    })

    it('does not abbreviate when shouldAbbreviate is false', async () => {
      const component = await mountSuspended(Usd, {
        props: {
          amount: '200000',
          shouldAbbreviate: false
        },
        slots: {
          prefix: () => '$'
        }
      })

      expect(component.text()).toBe('$200,000.00')
    })

    it(`when shouldAbbreviate is false, there is no decimals when above ${DEFAULT_ABBREVIATION_THRESHOLD}`, async () => {
      const component = await mountSuspended(Usd, {
        props: {
          amount: `${DEFAULT_ABBREVIATION_THRESHOLD}.12345678`,
          shouldAbbreviate: false
        }
      })

      expect(component.text()).toBe('1,000,000')
    })

    it(`when shouldAbbreviate is false, there is no decimals when below ${DEFAULT_ABBREVIATION_THRESHOLD}`, async () => {
      const component = await mountSuspended(Usd, {
        props: {
          amount: `100000.12345678`,
          shouldAbbreviate: false
        }
      })

      expect(component.text()).toBe('100,000.12')
    })

    it('handles very large numbers', async () => {
      const component = await mountSuspended(Usd, {
        props: {
          amount: '1500000001'
        },
        slots: {
          prefix: () => '$'
        }
      })

      expect(component.text()).toBe('$≈1.5B')
    })
  })

  describe('negative numbers', () => {
    it('handles negative numbers correctly', async () => {
      const component = await mountSuspended(Usd, {
        props: {
          amount: '-1234.567'
        },
        slots: {
          prefix: () => '$'
        }
      })

      expect(component.text()).toBe('-$1,234.56')
    })

    it('handles negative small numbers with "smaller than"', async () => {
      const component = await mountSuspended(Usd, {
        props: {
          amount: '-0.0000123'
        },
        slots: {
          prefix: () => '$'
        }
      })

      expect(component.text()).toBe('-$<0.01')
    })
  })

  describe('rounding modes', () => {
    it('uses ROUND_DOWN by default', async () => {
      const component = await mountSuspended(Usd, {
        props: {
          amount: '1.999'
        },
        slots: {
          prefix: () => '$'
        }
      })

      expect(component.text()).toBe('$1.99')
    })

    it('respects custom rounding mode', async () => {
      const component = await mountSuspended(Usd, {
        props: {
          amount: '1.999',
          roundingMode: BigNumber.ROUND_UP
        },
        slots: {
          prefix: () => '$'
        }
      })

      expect(component.text()).toBe('$2.00')
    })

    it('rounding affects "smaller than" threshold', async () => {
      const component = await mountSuspended(Usd, {
        props: {
          amount: '0.004',
          roundingMode: BigNumber.ROUND_DOWN
        },
        slots: {
          prefix: () => '$'
        }
      })

      expect(component.text()).toBe('$<0.01')
    })
  })

  describe('zero handling', () => {
    it('shows zero with proper USD formatting', async () => {
      const component = await mountSuspended(Usd, {
        props: {
          amount: '0'
        },
        slots: {
          prefix: () => '$'
        }
      })

      expect(component.text()).toBe('$0.00')
    })

    it('handles zero with different rounding modes', async () => {
      const component = await mountSuspended(Usd, {
        props: {
          amount: '0',
          roundingMode: BigNumber.ROUND_UP
        },
        slots: {
          prefix: () => '$'
        }
      })

      expect(component.text()).toBe('$0.00')
    })
  })

  describe('prop combinations', () => {
    it('custom rounding with small numbers', async () => {
      const component = await mountSuspended(Usd, {
        props: {
          amount: '0.0000567',
          roundingMode: BigNumber.ROUND_UP
        },
        slots: {
          prefix: () => '$'
        }
      })

      expect(component.text()).toBe('$<0.01')
    })
  })

  describe('hideDecimals behavior', () => {
    it('shows decimals by default', async () => {
      const component = await mountSuspended(Usd, {
        props: {
          amount: '123.45'
        },
        slots: {
          prefix: () => '$'
        }
      })

      expect(component.text()).toBe('$123.45')
    })

    it('hides decimals when hideDecimals is true', async () => {
      const component = await mountSuspended(Usd, {
        props: {
          amount: '123.45',
          hideDecimals: true
        },
        slots: {
          prefix: () => '$'
        }
      })

      expect(component.text()).toBe('$123')
    })

    it('rounds down when hideDecimals is true', async () => {
      const component = await mountSuspended(Usd, {
        props: {
          amount: '123.99',
          hideDecimals: true
        },
        slots: {
          prefix: () => '$'
        }
      })

      expect(component.text()).toBe('$123')
    })

    it('works with large numbers and hideDecimals', async () => {
      const component = await mountSuspended(Usd, {
        props: {
          amount: '1234567.89',
          hideDecimals: true
        },
        slots: {
          prefix: () => '$'
        }
      })

      expect(component.text()).toBe('$≈1.2M')
    })

    it('works with hideDecimals and shouldAbbreviate false', async () => {
      const component = await mountSuspended(Usd, {
        props: {
          amount: '1234567.89',
          hideDecimals: true,
          shouldAbbreviate: false
        },
        slots: {
          prefix: () => '$'
        }
      })

      expect(component.text()).toBe('$1,234,567')
    })

    it('handles zero with hideDecimals', async () => {
      const component = await mountSuspended(Usd, {
        props: {
          amount: '0',
          hideDecimals: true
        },
        slots: {
          prefix: () => '$'
        }
      })

      expect(component.text()).toBe('$0')
    })

    it('handles negative numbers with hideDecimals', async () => {
      const component = await mountSuspended(Usd, {
        props: {
          amount: '-123.45',
          hideDecimals: true
        },
        slots: {
          prefix: () => '$'
        }
      })

      expect(component.text()).toBe('-$123')
    })

    it('handles very small numbers with hideDecimals', async () => {
      const component = await mountSuspended(Usd, {
        props: {
          amount: '0.99',
          hideDecimals: true
        },
        slots: {
          prefix: () => '$'
        }
      })

      expect(component.text()).toBe('$<1')
    })

    it('respects custom rounding mode with hideDecimals', async () => {
      const component = await mountSuspended(Usd, {
        props: {
          amount: '123.45',
          hideDecimals: true,
          roundingMode: BigNumber.ROUND_UP
        },
        slots: {
          prefix: () => '$'
        }
      })

      expect(component.text()).toBe('$124')
    })
  })

  describe('subscript behavior', () => {
    it('uses subscript for very small numbers when useSubscript is true', async () => {
      const component = await mountSuspended(Usd, {
        props: {
          amount: '0.001234',
          useSubscript: true
        },
        slots: {
          prefix: () => '$'
        }
      })

      expect(component.html()).toMatchInlineSnapshot(`"<span><!--v-if-->$<span>0.0<sub>2</sub>1234</span></span>"`)
    })

    it('does not use subscript when useSubscript is false', async () => {
      const component = await mountSuspended(Usd, {
        props: {
          amount: '0.001234',
          useSubscript: false
        },
        slots: {
          prefix: () => '$'
        }
      })

      expect(component.html()).toMatchInlineSnapshot(`"<span><!--v-if-->$<span>&lt;0.01</span></span>"`)
    })

    it('works with negative numbers and subscript', async () => {
      const component = await mountSuspended(Usd, {
        props: {
          amount: '-0.001234',
          useSubscript: true
        },
        slots: {
          prefix: () => '$'
        }
      })

      expect(component.html()).toMatchInlineSnapshot(`"<span><span>-</span>$<span>0.0<sub>2</sub>1234</span></span>"`)
    })
  })

  describe('slot behavior', () => {
    it('works without prefix slot', async () => {
      const component = await mountSuspended(Usd, {
        props: {
          amount: '123.45'
        }
      })

      expect(component.text()).toBe('123.45')
    })

    it('works with custom prefix', async () => {
      const component = await mountSuspended(Usd, {
        props: {
          amount: '123.45'
        },
        slots: {
          prefix: () => '$'
        }
      })

      expect(component.text()).toBe('$123.45')
    })

    it('prefix works with negative numbers', async () => {
      const component = await mountSuspended(Usd, {
        props: {
          amount: '-123.45'
        },
        slots: {
          prefix: () => '$'
        }
      })

      expect(component.text()).toBe('-$123.45')
    })
  })
})
