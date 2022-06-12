// @ts-nocheck
import Vue from 'vue'

import Badge from '~/components/elements/badge.vue'
import BarSteps from '~/components/elements/bar-steps.vue'
import Button from '~/components/elements/button.vue'
import ButtonFilter from '~/components/elements/button-filter.vue'
import ButtonSelect from '~/components/elements/button-select.vue'
import Card from '~/components/elements/card.vue'
import CardSelect from '~/components/elements/card-select.vue'
import CardTableWrap from '~/components/elements/card-table-wrap.vue'
import Checkbox from '~/components/elements/checkbox.vue'
import Input from '~/components/inputs/input.vue'
import Modal from '~/components/elements/modal.vue'
import Panel from '~/components/elements/panel.vue'
import ProgressSteps from '~/components/elements/progress-steps'
import ResourceCard from '~/components/elements/resource-card.vue'
import Separator from '~/components/elements/separator.vue'
import Search from '~/components/elements/search.vue'
import TableWrapper from '~/components/elements/table-wrapper.vue'
import TextInfo from '~/components/elements/text-info.vue'
import VUserWalletConnectWarning from '~/components/elements/user-wallet-connect-warning.vue'
import VEmptyList from '~/components/elements/empty-list.vue'
import HocLoading from '~/components/hoc/loading.vue'
import IconInfoTooltip from '~/components/elements/info-icon-tooltip.vue'
import IconCheckTooltip from '~/components/elements/info-check-tooltip.vue'

// UI Specific elements
import VNumber from '~/components/partials/common/elements/number.vue'
import VEmpNumber from '~/components/partials/common/elements/emp-number.vue'

Vue.component('VBadge', Badge)
Vue.component('VBarSteps', BarSteps)
Vue.component('VButton', Button)
Vue.component('VButtonFilter', ButtonFilter)
Vue.component('VButtonSelect', ButtonSelect)
Vue.component('VCard', Card)
Vue.component('VCardSelect', CardSelect)
Vue.component('VCardTableWrap', CardTableWrap)
Vue.component('VCheckbox', Checkbox)
Vue.component('VEmpNumber', VEmpNumber)
Vue.component('VInput', Input)
Vue.component('VModal', Modal)
Vue.component('VNumber', VNumber)
Vue.component('VPanel', Panel)
Vue.component('ProgressSteps', ProgressSteps)
Vue.component('ResourceCard', ResourceCard)
Vue.component('VSeparator', Separator)
Vue.component('HocLoading', HocLoading)
Vue.component('VSearch', Search)
Vue.component('TableWrapper', TableWrapper)
Vue.component('TextInfo', TextInfo)
Vue.component('UserWalletConnectWarning', VUserWalletConnectWarning)
Vue.component('EmptyList', VEmptyList)
Vue.component('IconInfoTooltip', IconInfoTooltip)
Vue.component('IconCheckTooltip', IconCheckTooltip)
