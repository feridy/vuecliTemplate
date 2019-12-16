import Vue from 'vue';
import {
  Confirm,
  Alert,
  Toast,
  Notify,
  Loading,
} from 'vue-ydui/dist/lib.rem/dialog';
import {
  InfiniteScroll,
} from 'vue-ydui/dist/lib.rem/infinitescroll';
import VueWechatTitle from 'vue-wechat-title';
import App from './App.vue';
import './css/mycss.css';
import './fonts/iconfont.css';
import router from './router';

Vue.config.productionTip = false;
Vue.use(VueWechatTitle);
Vue.component(InfiniteScroll.name, InfiniteScroll);
Vue.prototype.$dialog = {
  confirm: Confirm,
  alert: Alert,
  toast: Toast,
  notify: Notify,
  loading: Loading,
};

// 判断移动端的设备类型，分为android和ios
const isAndroid = window.navigator.appVersion.match(/android/gi);
const isIPhone = window.navigator.appVersion.match(/iphone/gi);
const pixelRatio = Math.floor(window.devicePixelRatio);
const htmlObj = document.documentElement;
let dpr = 1;
if (isIPhone) {
  dpr = pixelRatio;
}

if (isAndroid) {
  dpr = 1;
}

htmlObj.setAttribute('dpr', dpr);

new Vue({
  router,
  render: h => h(App),
}).$mount('#app');
