import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import axios from "axios";
import VueAxios from "vue-axios";
import ElementUI from "element-ui";
import "element-ui/lib/theme-chalk/index.css";
import "font-awesome/css/font-awesome.min.css";
import echarts from "echarts";
import $ from "jquery";

// 全局引入css
import "../src/static/css/common.css";

Vue.config.productionTip = false;
Vue.use(VueAxios, axios);
Vue.use(ElementUI);

Vue.prototype.$axios = axios;
Vue.prototype.$echarts = echarts;

var vm = new Vue({
  router,
  store,
  render: h => h(App)
}).$mount("#app");
