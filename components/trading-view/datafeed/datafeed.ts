import { HistoryProvider } from './history-provider'
import { DataPulseProvider } from './data-pulse-provider'
import { ChronosApiProvider } from './chronos-provider'

export const extractField = (data: any, field: string, arrayIndex: number) => {
  const value = data[field]

  return Array.isArray(value) ? value[arrayIndex] : value
}

export const defaultConfiguration = () => {
  return {
    exchanges: [],
    supports_search: true,
    supports_group_request: false,
    supported_resolutions: [
      '1',
      '3',
      '5',
      '15',
      '30',
      '60',
      '120',
      '240',
      '360',
      '1D',
      '1W'
    ],
    supports_marks: false,
    supports_timescale_marks: false
  }
}

/**
 * This class implements interaction with UDF-compatible datafeed.
 * See UDF protocol reference at https://github.com/tradingview/charting_library/wiki/UDF
 */
export class Datafeed {
  private configuration: any

  private historyProvider: HistoryProvider

  private dataPulseProvider: DataPulseProvider

  private chronosProvider: ChronosApiProvider

  private configurationReadyPromise: Promise<any>

  constructor(datafeedURL: string, updateFrequency = 10 * 1000) {
    this.configuration = defaultConfiguration()
    this.chronosProvider = new ChronosApiProvider(datafeedURL)
    this.historyProvider = new HistoryProvider(datafeedURL)
    this.dataPulseProvider = new DataPulseProvider(
      this.historyProvider,
      updateFrequency
    )

    this.configurationReadyPromise = this.requestConfiguration().then(() => {
      this.setupWithConfiguration(defaultConfiguration())
    })
  }

  onReady(callback: Function) {
    this.configurationReadyPromise.then(() => {
      callback(this.configuration)
    })
  }

  getQuotes(
    _symbols: string,
    _onDataCallback: Function,
    _onErrorCallback: Function
  ) {
    throw new Error('Quotes not supported')
  }

  subscribeQuotes(
    _symbols: any,
    _fastSymbols: any,
    _onRealtimeCallback: any,
    _listenerGuid: string
  ) {
    throw new Error('Quotes not supported')
  }

  unsubscribeQuotes(_listenerGuid: string) {
    throw new Error('Quotes not supported')
  }

  getMarks(
    _symbolInfo: any,
    _from: string,
    _to: string,
    _onDataCallback: Function,
    _resolution: any
  ) {
    throw new Error('Marks not supported')
  }

  getTimescaleMarks(
    _symbolInfo: any,
    _from: string,
    _to: string,
    _onDataCallback: Function,
    _resolution: any
  ) {
    throw new Error('Marks not supported')
  }

  getServerTime(_callback: Function) {
    if (!this.configuration.supports_time) {
      return
    }

    throw new Error('Marks not supported')
  }

  searchSymbols(
    _userInput: string,
    _exchange: string,
    _symbolType: string,
    _onResult: Function
  ) {
    throw new Error('Symbol search not supported')
  }

  resolveSymbol(
    symbolName: string,
    onResolve: Function,
    onError: Function,
    _extension: any
  ) {
    function onResultReady(symbolInfo: any) {
      onResolve(symbolInfo)
    }

    if (this.configuration.supports_group_request) {
      throw new Error('Inconsistent configuration (symbols storage)')
    }

    if (!this.configuration.supports_group_request) {
      const params = {
        symbol: symbolName
      } as any

      this.chronosProvider
        .getSymbol(params.symbol)
        .then((response: any) => {
          if (response.s !== undefined) {
            onError('Something happened. The symbol was not found')
          } else {
            onResultReady(response)
          }
        })
        .catch((_error: any) => {
          onError('Something happened. The symbol was not found')
        })
    }
  }

  getBars(
    symbolInfo: any,
    resolution: any,
    from: any,
    to: any,
    onResult: any,
    onError: any
  ) {
    const periodObject = {
      from,
      to
    }

    this.historyProvider
      .getBars(symbolInfo, resolution, periodObject)
      .then((result: any) => {
        onResult(result.bars, result.meta)
      })
      .catch(onError)
  }

  subscribeBars(
    symbolInfo: any,
    resolution: any,
    onTick: any,
    listenerGuid: string
  ) {
    this.dataPulseProvider.subscribeBars(
      symbolInfo,
      resolution,
      onTick,
      listenerGuid
    )
  }

  unsubscribeBars(listenerGuid: string) {
    this.dataPulseProvider.unsubscribeBars(listenerGuid)
  }

  private requestConfiguration() {
    return this.chronosProvider.getConfig().catch((_reason: any) => {
      return null
    })
  }

  private setupWithConfiguration(configurationData: any) {
    this.configuration = configurationData

    if (configurationData.exchanges === undefined) {
      configurationData.exchanges = []
    }

    if (
      !configurationData.supports_search &&
      !configurationData.supports_group_request
    ) {
      throw new Error(
        'Unsupported datafeed configuration. Must either support search, or support group request'
      )
    }
  }
}
