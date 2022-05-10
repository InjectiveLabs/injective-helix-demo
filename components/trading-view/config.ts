import '~/static/chart/datafeeds/udf/build/polyfills.js'
import { Datafeed } from './datafeed/index'
import { BASE_URL } from '~/app/utils/constants'

const { theme } = require('../../tailwind.config')

const STYLE_CANDLES = 1

export default function ({
  containerId,
  symbol,
  interval,
  datafeedEndpoint
}: {
  containerId: string
  symbol: string
  interval: string
  datafeedEndpoint: string
}) {
  const timezone = window.Intl
    ? window.Intl.DateTimeFormat().resolvedOptions().timeZone
    : 'UTC'

  return {
    debug: false,
    autosize: true,
    symbol,
    interval,
    timezone,
    container_id: containerId,
    timeframe: '1W',
    toolbar_bg: theme.colors.gray[900],
    height: '100%',
    width: '100%',
    allow_symbol_change: false,
    datafeed: new Datafeed(datafeedEndpoint, 2000),
    library_path: `${
      window.location ? window.location.origin : BASE_URL
    }/chart/charting_library/`,
    custom_css_url: `${
      window.location ? window.location.origin : BASE_URL
    }/chart/charting_library/custom.css?v5`,
    locale: 'en',
    theme: 'dark',
    drawings_access: {
      type: 'black' as 'black' | 'white',
      tools: [{ name: 'Regression Trend', grayed: true }]
    },
    disabled_features: [
      'header_compare',
      'header_symbol_search',
      'header_saveload_to_the_right',
      'header_interval_dialog_button',
      'remove_library_container_border',
      'uppercase_instrument_names',
      'go_to_date',
      'volume_force_overlay'
    ],
    enabled_features: [
      'move_logo_to_main_pane',
      'hide_last_na_study_output',
      'clear_bars_on_series_error',
      'dont_show_boolean_study_arguments',
      'narrow_chart_enabled',
      'side_toolbar_in_fullscreen_mode',
      'save_chart_properties_to_local_storage',
      'use_localstorage_for_settings'
    ],
    client_id: 'injective.exchange',
    loading_screen: {
      backgroundColor: theme.colors.gray[800],
      foregroundColor: theme.colors.gray[200]
    },
    overrides: {
      'paneProperties.background': theme.colors.gray[900],
      'paneProperties.vertGridProperties.color': theme.colors.gray[700],
      'paneProperties.horzGridProperties.color': theme.colors.gray[700],
      'paneProperties.vertGridProperties.style': 1,
      'paneProperties.horzGridProperties.style': 1,
      'paneProperties.crossHairProperties.color': theme.colors.gray[200],

      'scalesProperties.textColor': theme.colors.gray[200],
      'scalesProperties.lineColor': theme.colors.gray[700],

      // Select chart type
      'mainSeriesProperties.style': STYLE_CANDLES,
      'mainSeriesProperties.showCountdown': false,

      // Bar style
      'mainSeriesProperties.barStyle.upColor': theme.colors.aqua[500],
      'mainSeriesProperties.barStyle.downColor': theme.colors.red[500],
      'mainSeriesProperties.barStyle.barColorsOnPrevClose': false,
      'mainSeriesProperties.barStyle.dontDrawOpen': true,
      // Candle Style
      'mainSeriesProperties.candleStyle.upColor': theme.colors.aqua[500],
      'mainSeriesProperties.candleStyle.borderUpColor': theme.colors.aqua[500],
      'mainSeriesProperties.candleStyle.downColor': theme.colors.red[500],
      'mainSeriesProperties.candleStyle.borderDownColor': theme.colors.red[500],
      'mainSeriesProperties.candleStyle.drawWick': true,
      'mainSeriesProperties.candleStyle.wickUpColor': theme.colors.aqua[500],
      'mainSeriesProperties.candleStyle.wickDownColor': theme.colors.red[500],
      'mainSeriesProperties.candleStyle.barColorsOnPrevClose': false,
      // Hollow Candle Style
      'mainSeriesProperties.hollowCandleStyle.upColor': theme.colors.aqua[500],
      'mainSeriesProperties.hollowCandleStyle.borderUpColor':
        theme.colors.aqua[500],
      'mainSeriesProperties.hollowCandleStyle.downColor': theme.colors.red[500],
      'mainSeriesProperties.hollowCandleStyle.borderDownColor':
        theme.colors.red[500],
      'mainSeriesProperties.hollowCandleStyle.drawWick': false,
      // Heikin Ashi styles
      'mainSeriesProperties.haStyle.upColor': theme.colors.aqua[500],
      'mainSeriesProperties.haStyle.downColor': theme.colors.red[500],
      'mainSeriesProperties.haStyle.drawWick': true,
      'mainSeriesProperties.haStyle.drawBorder': true,
      'mainSeriesProperties.haStyle.borderColor': '',
      'mainSeriesProperties.haStyle.borderUpColor': theme.colors.aqua[500],
      'mainSeriesProperties.haStyle.borderDownColor': theme.colors.red[500],
      'mainSeriesProperties.haStyle.wickUpColor': theme.colors.aqua[500],
      'mainSeriesProperties.haStyle.wickDownColor': theme.colors.red[500],
      'mainSeriesProperties.haStyle.barColorsOnPrevClose': false,
      // Area Style
      'mainSeriesProperties.areaStyle.color1': theme.colors.aqua[500],
      'mainSeriesProperties.areaStyle.color2': theme.colors.red[500],
      'mainSeriesProperties.areaStyle.linecolor': theme.colors.red[500],
      // Line styles
      'mainSeriesProperties.lineStyle.color': theme.colors.red[500],
      'mainSeriesProperties.lineStyle.linestyle': 0,
      'mainSeriesProperties.lineStyle.linewidth': 1,
      // Baseline styles
      'mainSeriesProperties.baselineStyle.baselineColor':
        theme.colors.gray[200],
      'mainSeriesProperties.baselineStyle.topFillColor1':
        theme.colors.aqua[500],
      'mainSeriesProperties.baselineStyle.topFillColor2':
        'rgba( 78, 205, 196, 0.1)',
      'mainSeriesProperties.baselineStyle.bottomFillColor1':
        theme.colors.red[500],
      'mainSeriesProperties.baselineStyle.bottomFillColor2':
        'rgba( 205, 78, 87, 0.1)',
      'mainSeriesProperties.baselineStyle.topLineColor': theme.colors.aqua[500],
      'mainSeriesProperties.baselineStyle.bottomLineColor':
        theme.colors.red[500],
      // Legend properties
      'paneProperties.legendProperties.showSeriesTitle': false,
      'paneProperties.legendProperties.showSeriesOHLC': true,
      'paneProperties.legendProperties.showStudyTitles': true,
      'paneProperties.legendProperties.showStudyValues': true,
      'paneProperties.topMargin': 12,
      'paneProperties.bottomMargin': 2,
      'scalesProperties.fontSize': 12,
      'scalesProperties.showSymbolLabels': false,
      'scalesProperties.showStudyLastValue': false,
      'symbolWatermarkProperties.color': theme.colors.gray[800],
      volumePaneSize: 'medium'
    },
    studies_overrides: {
      'volume.volume.color.0': theme.colors.red[500],
      'volume.volume.color.1': theme.colors.aqua[500]
    },
    time_frames: [
      { text: '1D', resolution: '5', description: '1 Day' },
      { text: '1W', resolution: '15', description: '1 Week' },
      { text: '1M', resolution: '60', description: '1 Month' },
      { text: '3M', resolution: 'D', description: '3 Month' }
    ],
    favorites: {
      chartTypes: ['Candle']
    }
  }
}
