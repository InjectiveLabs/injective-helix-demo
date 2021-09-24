import Vue from 'vue'
import Card from '~/components/elements/card.vue'
import Button from '~/components/elements/button.vue'
import Modal from '~/components/elements/modal.vue'
import Input from '~/components/inputs/input.vue'
import VIconInfoTooltip from '~/components/partials/common/elements/info-icon-tooltip.vue'
import VUserWalletConnectWarning from '~/components/elements/user-wallet-connect-warning.vue'

Vue.component('VCard', Card)
Vue.component('VButton', Button)
Vue.component('VModal', Modal)
Vue.component('VInput', Input)
Vue.component('VIconInfoTooltip', VIconInfoTooltip)
Vue.component('VUserWalletConnectWarning', VUserWalletConnectWarning)
