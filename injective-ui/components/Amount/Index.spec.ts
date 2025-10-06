import Index from './Index.vue'
import { it, expect, describe } from 'vitest'
import { BigNumber } from '@injectivelabs/utils'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { DEFAULT_ABBREVIATION_THRESHOLD } from '../../utils/constant/index'

describe('Amount/Index.vue', () => {
  describe('default behavior', () => {
    const testCases = [
      { input: '0.01100000', output: '0.011' },
      { input: '1234.12345678', output: '1,234.123456' },
      { input: '1.01', output: '1.01' },
      { input: '1.1', output: '1.1' },
      { input: '1000000000.123', output: '≈1B' },
      { input: '1234.1200000005253', output: '1,234.12' },
      { input: '1.00030004', output: '1.0003' },
      { input: '1234.1234565253', output: '1,234.123456' },
      { input: '1234567', output: '≈1.2M' }
    ]

    it.each(testCases)(
      'formats $input to $output by default',
      async ({ input, output }) => {
        const component = await mountSuspended(Index, {
          props: {
            amount: input
          }
        })

        expect(component.text()).toBe(output)
      }
    )

    describe('small number with "<"', () => {
      const smallNumberCases = [
        '0.0000001',
        '-0.0000001',
        '0.000000000001',
        '0.000000000001234',
        '1.000000000001234'
      ]

      it.each(smallNumberCases)(
        'formats small number %s with "<"',
        async (amount) => {
          const component = await mountSuspended(Index, {
            props: {
              amount
            }
          })
          expect(component.html()).toMatchSnapshot()
        }
      )
    })
  })

  describe('abbreviation behavior', () => {
    it('abbreviates large numbers by default', async () => {
      const component = await mountSuspended(Index, {
        props: {
          amount: '2000001'
        }
      })

      expect(component.text()).toBe('≈2M')
    })

    it('does not abbreviate when shouldAbbreviate is false', async () => {
      const component = await mountSuspended(Index, {
        props: {
          amount: '2000000',
          shouldAbbreviate: false
        }
      })

      expect(component.text()).toBe('2,000,000')
    })

    it(`when shouldAbbreviate is false, there is no decimals when above ${DEFAULT_ABBREVIATION_THRESHOLD}`, async () => {
      const component = await mountSuspended(Index, {
        props: {
          amount: `${DEFAULT_ABBREVIATION_THRESHOLD}.12345678`,
          shouldAbbreviate: false
        }
      })

      expect(component.text()).toBe('1,000,000')
    })

    it(`when shouldAbbreviate is false, there is no decimals when below ${DEFAULT_ABBREVIATION_THRESHOLD}`, async () => {
      const component = await mountSuspended(Index, {
        props: {
          amount: `100000.12345678`,
          shouldAbbreviate: false
        }
      })

      expect(component.text()).toBe('100,000.123456')
    })

    it('respects custom abbreviation threshold', async () => {
      const component = await mountSuspended(Index, {
        props: {
          amount: '500001',
          abbreviationThreshold: 100000
        }
      })

      expect(component.text()).toBe('≈500K')
    })

    it('does not use "<" for small numbers when useSubscript is true', async () => {
      const component = await mountSuspended(Index, {
        props: {
          decimals: 2,
          useSubscript: true,
          amount: '0.001234'
        }
      })

      expect(component.html()).toMatchInlineSnapshot(
        `"<span><!--v-if--><span>0.0<sub>2</sub>1234</span></span>"`
      )
    })

    it('uses a subscript for small numbers when useSubscript is true', async () => {
      const component = await mountSuspended(Index, {
        props: {
          decimals: 2,
          useSubscript: true,
          amount: '0.0001234'
        }
      })

      expect(component.html()).toMatchInlineSnapshot(
        `"<span><!--v-if--><span>0.0<sub>3</sub>1234</span></span>"`
      )
    })

    it('uses a subscript for small numbers when useSubscript is true and decimals is smaller than subscriptThresholdDecimals', async () => {
      const component = await mountSuspended(Index, {
        props: {
          decimals: 2,
          useSubscript: true,
          amount: '0.001234'
        }
      })

      expect(component.html()).toMatchInlineSnapshot(`"<span><!--v-if--><span>0.0<sub>2</sub>1234</span></span>"`)
    })
  })

  describe('decimal precision', () => {
    it('respects custom decimals', async () => {
      const component = await mountSuspended(Index, {
        props: {
          amount: '1.123456789',
          decimals: 2
        }
      })

      expect(component.text()).toBe('1.12')
    })

    it('adjusts decimals for abbreviated numbers', async () => {
      const component = await mountSuspended(Index, {
        props: {
          amount: '1500001',
          decimals: 6
        }
      })

      expect(component.text()).toBe('≈1.5M')
    })
  })

  describe('trailing zeros', () => {
    it('removes trailing zeros by default', async () => {
      const component = await mountSuspended(Index, {
        props: {
          amount: '1.10000'
        }
      })

      expect(component.text()).toBe('1.1')
    })

    it('keeps trailing zeros when noTrailingZeros is false', async () => {
      const component = await mountSuspended(Index, {
        props: {
          amount: '1.10000',
          noTrailingZeros: false
        }
      })

      expect(component.text()).toBe('1.100000')
    })
  })

  describe('zero handling', () => {
    it('shows zero normally by default', async () => {
      const component = await mountSuspended(Index, {
        props: {
          amount: '0'
        }
      })

      expect(component.text()).toBe('0')
    })

    it('shows em-dash for zero when showZeroAsEmDash is true', async () => {
      const component = await mountSuspended(Index, {
        props: {
          amount: '0',
          showZeroAsEmDash: true
        }
      })

      expect(component.html()).toContain('—')
    })
  })

  describe('negative numbers', () => {
    it('handles negative numbers correctly', async () => {
      const component = await mountSuspended(Index, {
        props: {
          amount: '-1234.567'
        }
      })

      expect(component.text()).toBe('-1,234.567')
    })

    it('handles negative small numbers with "<"', async () => {
      const component = await mountSuspended(Index, {
        props: {
          amount: '-0.000000123'
        }
      })

      expect(component.html()).toMatchInlineSnapshot(
        `"<span><span>-</span><span>&lt;0.000001</span></span>"`
      )
    })
  })

  describe('rounding modes', () => {
    it('uses ROUND_DOWN by default', async () => {
      const component = await mountSuspended(Index, {
        props: {
          amount: '1.999999',
          decimals: 2
        }
      })

      expect(component.text()).toBe('1.99')
    })

    it('respects custom rounding mode', async () => {
      const component = await mountSuspended(Index, {
        props: {
          amount: '1.999999',
          decimals: 2,
          roundingMode: BigNumber.ROUND_UP,
          noTrailingZeros: false
        }
      })

      expect(component.text()).toBe('2.00')
    })
  })

  describe('prop combinations', () => {
    it('no trailing zeros with custom decimals', async () => {
      const component = await mountSuspended(Index, {
        props: {
          amount: '1.5',
          decimals: 4,
          noTrailingZeros: true
        }
      })

      expect(component.text()).toBe('1.5')
    })

    it('trailing zeros with subscripts', async () => {
      const component = await mountSuspended(Index, {
        props: {
          amount: '0.00001',
          useSubscript: true,
          noTrailingZeros: false
        }
      })

      expect(component.html()).toMatchInlineSnapshot(
        `"<span><!--v-if--><span>0.0<sub>4</sub>1000</span></span>"`
      )
    })
  })
})
