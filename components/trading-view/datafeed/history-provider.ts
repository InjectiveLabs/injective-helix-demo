import { ChronosApiProvider } from './chronos-provider'
import { getErrorMessage } from './helpers'
import { marketTradingViewFilters } from '~/app/data/trading-view'

export class HistoryProvider {
  private chronosApiProvider: ChronosApiProvider

  constructor(datafeedUrl: string) {
    this.chronosApiProvider = new ChronosApiProvider(datafeedUrl)
  }

  getBars(
    symbolInfo: any,
    resolution: number | string,
    periodParams: {
      from: string
      to: string
      countBack?: number
      firstDataRequest?: boolean
    }
  ) {
    return new Promise((resolve, reject) => {
      this.chronosApiProvider
        .getBars({
          symbol: symbolInfo.ticker,
          from: periodParams.from,
          to: periodParams.to,
          countBack: periodParams.countBack,
          firstDataRequest: periodParams.firstDataRequest,
          resolution: resolution.toString()
        })
        .then((response: any) => {
          if (response.s !== 'ok' && response.s !== 'no_data') {
            reject(response.errmsg)
            return
          }

          const bars = [] as any
          const meta = {
            noData: false
          } as any

          if (response.s === 'no_data') {
            meta.noData = true
            meta.nextTime = response.nextTime
          } else {
            const volumePresent = response.v !== undefined
            const ohlPresent = response.o !== undefined

            for (let i = 0; i < response.t.length; ++i) {
              const barValue = {
                time: response.t[i] * 1000,
                close: parseFloat(response.c[i]),
                open: parseFloat(response.c[i]),
                high: parseFloat(response.c[i]),
                low: parseFloat(response.c[i])
              } as any

              if (ohlPresent) {
                barValue.open = parseFloat(response.o[i])
                barValue.high = parseFloat(response.h[i])
                barValue.low = parseFloat(response.l[i])
              }

              if (volumePresent) {
                barValue.volume = parseFloat(response.v[i])
              }

              bars.push(barValue)
            }
          }

          const { totalHigh, totalLow } = bars.reduce(
            (result: any, bar: any) => {
              return {
                totalHigh: result.totalHigh + bar.high,
                totalLow: result.totalLow + bar.low
              }
            },
            { totalLow: 0, totalHigh: 0 }
          )
          const avgHigh = bars.length === 0 ? 0 : totalHigh / bars.length
          const avgLow = bars.length === 0 ? 0 : totalLow / bars.length
          const upperMax = 0.7 // 70%
          const lowerMin = 0.3 // 30%
          const highLowDeviation = 0.2 // 20%

          const barIsInBond = (bar: any) =>
            bar.high >= avgHigh * upperMax && bar.low >= avgLow * lowerMin
          const barDoesNotHaveHighHighLowDeviation = (bar: any) =>
            bar.high && bar.low
              ? bar.high / bar.low <= 1 + highLowDeviation
              : true
          const barDoesNotHaveExcludedBars = (bar: any) => {
            const marketBarsFilter =
              // @ts-ignore
              marketTradingViewFilters[symbolInfo.ticker]

            if (!marketBarsFilter) {
              return true
            }

            const barExistsInExcludedList = marketBarsFilter.find(
              (high: number, low: number) => {
                return bar.high === high && bar.low === low
              }
            )

            return !barExistsInExcludedList
          }

          const barsInBounds = bars
            .filter(barIsInBond)
            .filter(barDoesNotHaveHighHighLowDeviation)
            .filter(barDoesNotHaveExcludedBars)

          resolve({
            bars: barsInBounds,
            meta
          })
        })
        .catch((error: any) => {
          const message = getErrorMessage(error)
          reject(message)
        })
    })
  }
}
