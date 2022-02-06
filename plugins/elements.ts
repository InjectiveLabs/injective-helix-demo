// @ts-nocheck
import Vue from 'vue'
import VUserWalletConnectWarning from '~/components/elements/user-wallet-connect-warning.vue'
import Card from '~/components/elements/card.vue'
import Separator from '~/components/elements/separator.vue'
import ResourceCard from '~/components/elements/resource-card.vue'
import CardTableWrap from '~/components/elements/card-table-wrap.vue'
import Panel from '~/components/elements/panel.vue'
import Badge from '~/components/elements/badge.vue'
import TextInfo from '~/components/elements/text-info.vue'
import Button from '~/components/elements/button.vue'
import ButtonFilter from '~/components/elements/button-filter.vue'
import Modal from '~/components/elements/modal.vue'
import Input from '~/components/inputs/input.vue'
import ButtonSelect from '~/components/elements/button-select.vue'
import CardSelect from '~/components/elements/card-select.vue'
import VIconInfoTooltip from '~/components/elements/info-icon-tooltip.vue'
import VIconCheckTooltip from '~/components/elements/info-check-tooltip.vue'

// UI Specific elements
import VNumber from '~/components/partials/common/elements/number.vue'
import VEmpNumber from '~/components/partials/common/elements/emp-number.vue'

Vue.component('VCard', Card)
Vue.component('VNumber', VNumber)
Vue.component('VEmpNumber', VEmpNumber)
Vue.component('VSeparator', Separator)
Vue.component('VResourceCard', ResourceCard)
Vue.component('VButtonFilter', ButtonFilter)
Vue.component('VCardTableWrap', CardTableWrap)
Vue.component('VPanel', Panel)
Vue.component('VBadge', Badge)
Vue.component('VButtonSelect', ButtonSelect)
Vue.component('VCardSelect', CardSelect)
Vue.component('VTextInfo', TextInfo)
Vue.component('VButton', Button)
Vue.component('VModal', Modal)
Vue.component('VInput', Input)
Vue.component('VIconInfoTooltip', VIconInfoTooltip)
Vue.component('VIconCheckTooltip', VIconCheckTooltip)
Vue.component('VUserWalletConnectWarning', VUserWalletConnectWarning)
