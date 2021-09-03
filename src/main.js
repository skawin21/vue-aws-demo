import Vue from 'vue'
import App from './App.vue'
import { authenticator, amplifySignOut } from '@aws-amplify/ui-vue'

import Amplify from 'aws-amplify';
import aws_exports from './aws-exports';
import { applyPolyfills, defineCustomElements, } from '@aws-amplify/ui-components/loader';
Amplify.configure(aws_exports);
applyPolyfills().then(() => {
  defineCustomElements(window);
});


Vue.config.productionTip = false

Vue.component('amplify-authenticator', authenticator)
Vue.component('amplify-sign-out', amplifySignOut)

new Vue({
  render: h => h(App),
}).$mount('#app')
