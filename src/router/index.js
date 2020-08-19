﻿import Vue from "vue";
import VueRouter from "vue-router";
import store from "../store/index.js";

// 下面是移动端页面/组件
import Home_mobile from "../views/Home_mobile.vue";
import Detail_mobile from "../views/Detail_mobile.vue";
import List_mobile from "../views/List_mobile.vue";
import ListDetail_mobile from "../views/ListDetail_mobile.vue";
import Login_mobile from "../views/Login_mobile.vue";
import Login_redirect from "../views/LoginRedirect_mobile.vue";
import SignUp_mobile from "../views/SignUp_mobile.vue";
import error from "../views/404.vue";

Vue.use(VueRouter);

/*
Vue-router在3.1之后把$router.push()方法改为了Promise。所以假如没有回调函数，错误信息就会交给全局的路由错误处理，
vue-router是先报了一个Uncaught (in promise)的错误(因为push没加回调)，然后再点击路由的时候才会触发NavigationDupli
 cated的错误(路由出现的错误，全局错误处理打印了出来)。

方案1
固定vue-router版本到3.0.7以下。这个方案没什么说的，就是简单粗暴，没有任何理由。但是你能确保以后不升级vue-router吗？

方案2
禁止全局路由错误处理打印，这个也是vue-router开发者给出的解决方案：
const originalPush = VueRouter.prototype.push
VueRouter.prototype.push = function push (location, onResolve, onReject) {
  return originalPush.call(this, location).catch(err => {
    return err
  })
}

方案3(高成本高收益)
vue-router的开发者也给出了解决方法，你需要为每个router.push增加回调函数。
router.push('/location').catch(err => {err})
对于我们来说这个解决方案的成本可能很高，但是是值得的。在vue-router 3.1版本之前的push调用时不会返回任何信息，假如push之后路由出现了问题也不会有任何的错误信息。
如果你使用方案1固定了vue-router的版本，那么以后的项目需要路由的回调时你根本无从下手。

方案4
如果你使用了Element-UI，并且方案2无法解决你的问题。那么你只能用方案1来固定你的vue-router版本了。
这是因为Element-UI的el-menu在重复点击路由的时候报的错误，而且这个错误是Element-UI内部的路由问题，你无法通过方案2和3去解决。
只能选择暂时不升级Vue-router。

好消息是Element-UI已经有了解决方案，预计在2.13.0版本会解决这个问题。参考Github上issue#17269。
*/

const routes = [
  {
    path: "*",
    redirect: "/404",
  },
  {
    path: "/",
    redirect() {
      return "/home";
    },
  },
  {
    path: "/404",

    component: error,
  },
  // 下面是移动端页面
  {
    path: "/home",
    component: Home_mobile,
  },
  {
    path: "/video",
    component: Detail_mobile,
  },
  {
    path: "/lists",
    component: List_mobile,
  },
  {
    path: "/listdetail",
    component: ListDetail_mobile,
  },
  {
    path: "/login",
    component: Login_mobile,
  },
  {
    path: "/login_redirect",
    component: Login_redirect,
  },
  {
    path: "/signUp",
    component: SignUp_mobile,
  },
];

const router = new VueRouter({
  /*  mode: 'history',
  base: process.env.BASE_URL,*/
  routes,
});

// -------------------------危险提示-------------------------
//   此函数将用户名保存在本地数据中且未加密，有泄露的风险！！！
// -------------------------危险提示-------------------------
router.beforeEach((to, from, next) => {
  // to将要访问的路径
  // from从哪个路径跳转而来
  //next('/xxx')表示放行,或强制跳转到/xxx

  if (to.path == "/login" || to.path == "/home") {
    // console.log("无权限页面放行");
    return next();
  }
  if (
    to.path == "/postvideo" ||
    to.path == "/edittag" ||
    to.path == "/users/me" ||
    to.path == "/createVideoList"
  ) {
    if (getCookie() && store.state.ifTruelyLogin != 2) {
      // console.log("已登录放行");
      return next();
    } else {
      // console.log("未登录不放行");
      // 保存跳转状态
      store.commit("changeifRouter", "1");
      store.commit("changerouterPath", to.path);
      if (to.path == "/postvideo") {
        if (to.query !== undefined) {
          store.commit("changerouterparams", to.query);
        }
      }
      return next("/login");
    }
  }
  next();
});

// 获取cookie
function getCookie() {
  if (document.cookie.length > 0) {
    var arr = document.cookie.split("; ");
    for (var i = 0; i < arr.length; i++) {
      var arr2 = arr[i].split(":");
      //判断查找相对应的值
      if (arr2[0] == "username") {
        if (arr2[1] != "") {
          return true;
        }
      }
    }
  }
  return false;
}
export default router;
