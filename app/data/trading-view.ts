const HIGH_LOW_DEVIATION = 0.2 // 10%

const barFilterByDeviation = (bar: any) => {
  return bar.high && bar.low
    ? bar.high / bar.low <= 1 + HIGH_LOW_DEVIATION
    : true
}

export const mapBarsToProperValuesByDeviation = (bars: any) => {
  return bars.map((bar: any, index: number) => {
    const barWithoutDeviation = barFilterByDeviation(bar)

    if (barWithoutDeviation) {
      return bar
    }

    for (let i = index + 1; i <= bars.length - 1; i++) {
      const nextBar = bars[i]
      const barWithoutDeviation = barFilterByDeviation(nextBar)

      if (barWithoutDeviation) {
        let newBar = {
          ...bar,
          time: bar.time
        }

        if (nextBar.high * (1 + HIGH_LOW_DEVIATION) <= bar.high) {
          newBar = {
            ...newBar,
            high: nextBar.close
          }
        }

        if (nextBar.open * (1 + HIGH_LOW_DEVIATION) <= bar.open) {
          newBar = {
            ...newBar,
            open: nextBar.low
          }
        }

        if (nextBar.low * (1 + HIGH_LOW_DEVIATION) >= bar.low) {
          newBar = {
            ...newBar,
            low: nextBar.open
          }
        }

        if (nextBar.close * (1 + HIGH_LOW_DEVIATION) >= bar.close) {
          newBar = {
            ...newBar,
            close: nextBar.low
          }
        }

        return newBar
      }
    }

    return bar
  })
}

const hardcodedExcludedTradesByMarket = {
  // WETH/USDT
  'peggy0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/peggy0xdAC17F958D2ee523a2206206994597C13D831ec7': {
    excludeBefore: null,
    bars: [
      {
        high: 4349.99,
        barMap: (bar: any) => ({ ...bar, close: 2114.333, high: 2114.333 })
      },
      {
        high: 4349.999,
        barMap: (bar: any) => ({
          ...bar,
          high: 2080.106,
          low: 2080.106,
          close: 2080.106
        })
      },
      {
        low: 1320.958,
        barMap: (bar: any) => ({ ...bar, low: 2710 })
      }
    ]
  },
  // GF/USDT
  'peggy0xAaEf88cEa01475125522e117BFe45cF32044E238/peggy0xdAC17F958D2ee523a2206206994597C13D831ec7': {
    excludeBefore: null,
    bars: [
      {
        high: 3.98,
        barMap: (bar: any) => ({ ...bar, high: 1.5 })
      }
    ]
  },
  // LINK/USDT
  'peggy0x514910771AF9Ca656af840dff83E8264EcF986CA/peggy0xdAC17F958D2ee523a2206206994597C13D831ec7': {
    excludeBefore: null,
    bars: [
      {
        high: 115.697,
        barMap: (bar: any) => ({ ...bar, high: 13.2 })
      },
      {
        high: 120.241,
        barMap: (bar: any) => ({ ...bar, high: 13.2 })
      },
      {
        high: 128.594,
        barMap: (bar: any) => ({ ...bar, high: 13.2 })
      },
      {
        high: 33.802,
        barMap: (bar: any) => ({ ...bar, high: 20, close: 20 })
      },
      {
        high: 31.48,
        barMap: (bar: any) => ({ ...bar, high: 14.1, low: 14 })
      },
      {
        high: 27.893,
        barMap: (bar: any) => ({ ...bar, high: 14.1, low: 14 })
      },
      {
        high: 28.302,
        barMap: (bar: any) => ({ ...bar, high: 13.1, low: 13 })
      },
      {
        high: 30.796,
        barMap: (bar: any) => ({ ...bar, high: 13.1, low: 13, close: 13.05 })
      },
      {
        high: 22.161,
        barMap: (bar: any) => ({ ...bar, high: 13.1 })
      },
      {
        high: 21.697,
        barMap: (bar: any) => ({ ...bar, high: 13.1 })
      },
      {
        high: 27.856,
        barMap: (bar: any) => ({ ...bar, high: 13.1 })
      }
    ]
  },
  // ATOM/USDT
  'ibc/C4CFF46FD6DE35CA4CF4CE031E643C8FDC9BA4B99AE598E9B0ED98FE3A2319F9/peggy0xdAC17F958D2ee523a2206206994597C13D831ec7': {
    excludeBefore: null,
    bars: [
      {
        low: 5.12,
        barMap: (bar: any) => ({ ...bar, low: 26 })
      }
    ]
  },
  // USDT/UST
  'ibc/B448C0CA358B958301D328CCDC5D5AD642FC30A6D3AE106FF721DB315F3DDE5C/peggy0xdAC17F958D2ee523a2206206994597C13D831ec7': {
    excludeBefore: null,
    bars: [
      {
        high: 1.5008,
        barMap: (bar: any) => ({ ...bar, high: 1 })
      },
      {
        high: 1.5003,
        barMap: (bar: any) => ({ ...bar, high: 1 })
      },
      {
        high: 1.0502,
        barMap: (bar: any) => ({ ...bar, high: 1 })
      },
      {
        low: 0.7496,
        barMap: (bar: any) => ({ ...bar, low: 0.99 })
      },
      {
        low: 0.65,
        barMap: (bar: any) => ({ ...bar, low: 0.99 })
      },
      {
        high: 500.4988,
        barMap: (bar: any) => ({ ...bar, high: 1, open: 0.99, low: 0.99 })
      }
    ]
  },
  // INJ/USDT
  'inj/peggy0xdAC17F958D2ee523a2206206994597C13D831ec7': {
    excludeBefore: null,
    bars: [
      {
        high: 12.566,
        barMap: (bar: any) => ({ ...bar, high: 5.2 })
      },
      {
        high: 13.364,
        barMap: (bar: any) => ({ ...bar, high: 5.6 })
      },
      {
        high: 13.885,
        barMap: (bar: any) => ({ ...bar, high: 5.7 })
      },
      {
        high: 15.119,
        barMap: (bar: any) => ({ ...bar, high: 6 })
      },
      {
        high: 16.938,
        barMap: (bar: any) => ({ ...bar, high: 4 })
      },
      {
        high: 16.34,
        barMap: (bar: any) => ({ ...bar, high: 6.43 })
      },
      {
        high: 1006.24,
        low: 60.06,
        barMap: (bar: any) => ({ ...bar, high: 12.4, close: 12.4 })
      },
      {
        high: 36.394,
        low: 60.06,
        barMap: (bar: any) => ({ ...bar, high: 7 })
      },
      {
        high: 13.05,
        barMap: (bar: any) => ({ ...bar, high: 6.1 })
      }
    ]
  },
  'BTC/USDT PERP': {
    excludeBefore: null,
    bars: [
      {
        low: 3,
        barMap: (bar: any) => ({ ...bar, low: 48300, close: 48300 })
      },
      {
        low: 35000,
        barMap: (bar: any) => ({ ...bar, low: 49900 })
      },
      {
        high: 68871.7,
        barMap: (bar: any) => ({ ...bar, high: 47500.0 })
      },
      {
        high: 65142.1,
        barMap: (bar: any) => ({ ...bar, high: 45860.0 })
      },
      {
        high: 68871.7,
        barMap: (bar: any) => ({ ...bar, high: 47500.0 })
      }
    ]
  },

  'INJ/USDT PERP': {
    excludeBefore: null,
    bars: [
      {
        high: 22029.913,
        barMap: (bar: any) => ({ ...bar, high: 5.36 })
      },
      {
        low: 2.941,
        barMap: (bar: any) => ({ ...bar, high: 6.0, low: 5.816 })
      },
      {
        low: 4.111,
        barMap: (bar: any) => ({ ...bar, high: 4.15, low: 4.2 })
      },
      {
        high: 16.938,
        barMap: (bar: any) => ({ ...bar, high: 5.2 })
      },
      {
        high: 13.054,
        barMap: (bar: any) => ({ ...bar, high: 6.07, close: 6.06 })
      }
    ]
  },

  'ETH/USDT PERP': {
    excludeBefore: null,
    bars: [
      {
        low: 0.1,
        barMap: (bar: any) => ({ ...bar, low: 2482 })
      },
      {
        low: 0.01,
        barMap: (bar: any) => ({ ...bar, low: 3870 })
      },
      {
        high: 10830.3,
        barMap: (bar: any) => ({ ...bar, high: 3485 })
      },
      {
        low: 1000,
        barMap: (bar: any) => ({ ...bar, low: 3875 })
      }
    ]
  },

  'BNB/USDT PERP': {
    excludeBefore: null,
    bars: [
      {
        low: 400,
        barMap: (bar: any) => ({ ...bar, low: 526 })
      },
      {
        low: 435.68,
        barMap: (bar: any) => ({ ...bar, low: 529 })
      },
      {
        low: 409.3,
        barMap: (bar: any) => ({ ...bar, low: 580 })
      }
    ]
  }
}

export const mapBarsToProperValues = (bars: any, ticker: string) => {
  // @ts-ignore
  const hardcodedExcludedTrades = hardcodedExcludedTradesByMarket[ticker]

  if (!hardcodedExcludedTrades) {
    return bars
  }

  let actualBars = bars

  if (hardcodedExcludedTrades.excludeBefore) {
    actualBars = actualBars.filter(
      (bar: any) => bar.time > hardcodedExcludedTrades.excludeBefore
    )
  }

  return actualBars.map((bar: any) => {
    const excludedTrade = hardcodedExcludedTrades.bars.find((trade: any) => {
      if (trade.high) {
        return (
          trade.high === bar.high && bar.high / bar.low > 1 + HIGH_LOW_DEVIATION
        )
      }

      if (trade.low) {
        return (
          trade.low === bar.low && bar.high / bar.low > 1 + HIGH_LOW_DEVIATION
        )
      }

      return false
    })

    if (!excludedTrade) {
      return bar
    }

    return excludedTrade.barMap(bar)
  })
}
