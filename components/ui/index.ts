import Vue from 'vue'

// Elements
import Badge from './elements/badge.vue'
import Loading from './elements/loading.vue'
import Button from './elements/button.vue'
import Spinner from './elements/spinner.vue'
import Overlay from './elements/overlay.vue'
import Card from './elements/card.vue'
import Panel from './../elements/panel.vue'
import ButtonSelect from './elements/button-select.vue'
import Icon from './elements/icon.vue'
import Text from './elements/text.vue'
import IconWrap from './elements/icon-wrap.vue'

import TextInfo from './text/info.vue'
import TextLabel from './text/label.vue'
import TableHead from './table/th.vue'
import TableTd from './table/td.vue'
import TableTr from './table/tr.vue'
import TableTrEmp from './table/tr-emp.vue'
import TableTdEmp from './table/td-emp.vue'

// Formatters
import FormatNumber from './formatters/number.vue'
import FormatOrderPrice from './formatters/order-price.vue'
import FormatPrice from './formatters/price.vue'
import FormatAmount from './formatters/amount.vue'
import FormatPercent from './formatters/percent.vue'
import { Icon as Icons } from '~/types'

// Icons
Object.values(Icons).forEach((icon) => {
  return Vue.component(`v-icon-${icon}`, require(`./icons/${icon}.vue`).default)
})

Vue.component('VPanel', Panel)

Vue.component('VUiBadge', Badge)
Vue.component('VUiButton', Button)
Vue.component('VUiOverlay', Overlay)
Vue.component('VUiLoading', Loading)
Vue.component('VUiSpinner', Spinner)
Vue.component('VUiCard', Card)
Vue.component('VUiIcon', Icon)
Vue.component('VUiText', Text)
Vue.component('VUiIconWrap', IconWrap)
Vue.component('VUiButtonSelect', ButtonSelect)

Vue.component('VUiTextInfo', TextInfo)
Vue.component('VUiTextLabel', TextLabel)
Vue.component('VUiTableTh', TableHead)
Vue.component('VUiTableTr', TableTr)
Vue.component('VUiTableTrEmp', TableTrEmp)
Vue.component('VUiTableTd', TableTd)
Vue.component('VUiTableTdEmp', TableTdEmp)

Vue.component('VUiFormatNumber', FormatNumber)
Vue.component('VUiFormatAmount', FormatAmount)
Vue.component('VUiFormatPrice', FormatPrice)
Vue.component('VUiFormatOrderPrice', FormatOrderPrice)
Vue.component('VUiFormatPercent', FormatPercent)
