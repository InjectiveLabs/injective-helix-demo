import Vue from 'vue'
import Card from '~/components/elements/card.vue'
import Panel from '~/components/elements/panel.vue'
import Badge from '~/components/elements/badge.vue'
import TextInfo from '~/components/elements/text-info.vue'
import Button from '~/components/elements/button.vue'
import Modal from '~/components/elements/modal.vue'
import Input from '~/components/inputs/input.vue'
import ButtonSelect from '~/components/elements/button-select.vue'
import VIconInfoTooltip from '~/components/elements/info-icon-tooltip.vue'
import VUserWalletConnectWarning from '~/components/elements/user-wallet-connect-warning.vue'

Vue.component('VCard', Card)
Vue.component('VPanel', Panel)
Vue.component('VBadge', Badge)
Vue.component('VButtonSelect', ButtonSelect)
Vue.component('VTextInfo', TextInfo)
Vue.component('VButton', Button)
Vue.component('VModal', Modal)
Vue.component('VInput', Input)
Vue.component('VIconInfoTooltip', VIconInfoTooltip)
Vue.component('VUserWalletConnectWarning', VUserWalletConnectWarning)
