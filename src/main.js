import Vue from 'vue'
import App from './App.vue'
import '@aws-amplify/ui-vue'

import Amplify from 'aws-amplify';
import aws_exports from './aws-exports';
import { applyPolyfills, defineCustomElements, } from '@aws-amplify/ui-components/loader';
import router from './router'
Amplify.configure(aws_exports);
applyPolyfills().then(() => {
  defineCustomElements(window);
});

Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
