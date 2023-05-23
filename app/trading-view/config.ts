import './datafeed/polyfills'
import { Datafeed } from './datafeed/index'
import { colors } from '@/nuxt-config/tailwind'
import { BASE_URL } from '@/app/utils/constants'
import {
  Timezone,
  ResolutionString,
  ChartingLibraryWidgetOptions
} from '@/assets/js/chart/charting_library'

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
}): ChartingLibraryWidgetOptions {
  const timezone = window.Intl
    ? window.Intl.DateTimeFormat().resolvedOptions().timeZone
    : 'Etc/UTC'

  return {
    symbol,
    timezone: timezone as Timezone,
    debug: false,
    autosize: true,
    interval: interval as ResolutionString,
    container: containerId,
    timeframe: '1M',
    toolbar_bg: colors.gray[950],
    height: 100,
    width: 100,
    datafeed: new Datafeed(datafeedEndpoint, 2000),
    library_path: `${
      window.location ? window.location.origin : BASE_URL
    }/chart/charting_library/`,
    custom_css_url: `${
      window.location ? window.location.origin : BASE_URL
    }/chart/charting_library/custom.css?v1`,
    locale: 'en',
    theme: 'Dark',
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
      backgroundColor: colors.gray[950],
      foregroundColor: colors.gray[400]
    },
    overrides: {
      'paneProperties.background': colors.gray[950],
      'paneProperties.backgroundType': 'solid',
      'paneProperties.vertGridProperties.color': colors.gray[700],
      'paneProperties.horzGridProperties.color': colors.gray[700],
      'paneProperties.vertGridProperties.style': 1,
      'paneProperties.horzGridProperties.style': 1,
      'paneProperties.crossHairProperties.color': colors.gray[200],

      'scalesProperties.textColor': colors.gray[200],
      'scalesProperties.lineColor': colors.gray[700],

      // Select chart type
      'mainSeriesProperties.style': STYLE_CANDLES,
      'mainSeriesProperties.showCountdown': false,

      // Bar style
      'mainSeriesProperties.barStyle.upColor': colors.green[500],
      'mainSeriesProperties.barStyle.downColor': colors.red[500],
      'mainSeriesProperties.barStyle.barColorsOnPrevClose': false,
      'mainSeriesProperties.barStyle.dontDrawOpen': true,
      // Candle Style
      'mainSeriesProperties.candleStyle.upColor': colors.green[500],
      'mainSeriesProperties.candleStyle.borderUpColor': colors.green[500],
      'mainSeriesProperties.candleStyle.downColor': colors.red[500],
      'mainSeriesProperties.candleStyle.borderDownColor': colors.red[500],
      'mainSeriesProperties.candleStyle.drawWick': true,
      'mainSeriesProperties.candleStyle.wickUpColor': colors.green[500],
      'mainSeriesProperties.candleStyle.wickDownColor': colors.red[500],
      'mainSeriesProperties.candleStyle.barColorsOnPrevClose': false,
      // Hollow Candle Style
      'mainSeriesProperties.hollowCandleStyle.upColor': colors.green[500],
      'mainSeriesProperties.hollowCandleStyle.borderUpColor': colors.green[500],
      'mainSeriesProperties.hollowCandleStyle.downColor': colors.red[500],
      'mainSeriesProperties.hollowCandleStyle.borderDownColor': colors.red[500],
      'mainSeriesProperties.hollowCandleStyle.drawWick': false,
      // Heikin Ashi styles
      'mainSeriesProperties.haStyle.upColor': colors.green[500],
      'mainSeriesProperties.haStyle.downColor': colors.red[500],
      'mainSeriesProperties.haStyle.drawWick': true,
      'mainSeriesProperties.haStyle.drawBorder': true,
      'mainSeriesProperties.haStyle.borderColor': '',
      'mainSeriesProperties.haStyle.borderUpColor': colors.green[500],
      'mainSeriesProperties.haStyle.borderDownColor': colors.red[500],
      'mainSeriesProperties.haStyle.wickUpColor': colors.green[500],
      'mainSeriesProperties.haStyle.wickDownColor': colors.red[500],
      'mainSeriesProperties.haStyle.barColorsOnPrevClose': false,
      // Area Style
      'mainSeriesProperties.areaStyle.color1': colors.green[500],
      'mainSeriesProperties.areaStyle.color2': colors.red[500],
      'mainSeriesProperties.areaStyle.linecolor': colors.red[500],
      // Line styles
      'mainSeriesProperties.lineStyle.color': colors.red[500],
      'mainSeriesProperties.lineStyle.linestyle': 0,
      'mainSeriesProperties.lineStyle.linewidth': 1,
      // Baseline styles
      'mainSeriesProperties.baselineStyle.baselineColor': colors.gray[200],
      'mainSeriesProperties.baselineStyle.topFillColor1': colors.green[500],
      'mainSeriesProperties.baselineStyle.topFillColor2':
        'rgba( 78, 205, 196, 0.1)',
      'mainSeriesProperties.baselineStyle.bottomFillColor1': colors.red[500],
      'mainSeriesProperties.baselineStyle.bottomFillColor2':
        'rgba( 205, 78, 87, 0.1)',
      'mainSeriesProperties.baselineStyle.topLineColor': colors.green[500],
      'mainSeriesProperties.baselineStyle.bottomLineColor': colors.red[500],
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
      'symbolWatermarkProperties.color': colors.gray[800],
      volumePaneSize: 'medium'
    },
    studies_overrides: {
      'volume.volume.color.0': colors.red[500],
      'volume.volume.color.1': colors.green[500]
    },
    time_frames: [
      { text: '1D', resolution: '5' as ResolutionString, description: '1 Day' },
      {
        text: '1W',
        resolution: '15' as ResolutionString,
        description: '1 Week'
      },
      {
        text: '1M',
        resolution: '60' as ResolutionString,
        description: '1 Month'
      },
      {
        text: '3M',
        resolution: 'D' as ResolutionString,
        description: '3 Month'
      }
    ],
    favorites: {
      intervals: ['5', '15', '60', 'D'] as ResolutionString[],
      chartTypes: ['Candle']
    }
  }
}
