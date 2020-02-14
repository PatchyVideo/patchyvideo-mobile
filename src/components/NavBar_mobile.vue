<!--    vue组件：NavBar_mobile.vue     -->
<!--
    页面：paychyvideo-mobile的导航栏
    大小：100% * 64px
    功能：视频页面顶端的导航栏
    必要传入参数：主页的标签数据Tags
    其他说明：
    更新日志：
      2/14/2020：
        release
    ★待解决问题：
      1.播放列表里链接的复制功能因为涉及到对dom的直接操作，所以可能会有被抓住漏洞的风险
-->
<template>
  <div class="nav">
    <!-- 导航条 -->
    <div>
      <!-- 上半部分 -->
      <div class="navTop">
        <div class="avatar" @click="myInfo = true">
          <el-avatar :size="30" :src="userAvatar"></el-avatar>
        </div>
        <div v-show="showHotTags" @click="showHotTags=false" class="cancelSearch">取消</div>
        <div class="navSearch">
          <el-autocomplete
            id="ipt"
            ref="ipt"
            v-model="iptVal"
            :fetch-suggestions="querySearchAsync"
            :trigger-on-focus="false"
            @select="handleSelect"
            placeholder="想看什么视频呢"
            size="mini"
            @focus="showHotTags=true"
          >
            <el-button slot="append" icon="el-icon-search" @click="gotoHome"></el-button>
            <template slot-scope="{ item }">
              <div class="adviceList">
                <div
                  class="name"
                  v-bind:class="{
                      Copyright: item.cat == 2,
                      Language: item.cat == 5,
                      Character: item.cat == 1,
                      Author: item.cat == 3,
                      General: item.cat == 0,
                      Meta: item.cat == 4
                    }"
                >{{ item.tag }}</div>
                <div class="addr" v-if="item.cnt != null">{{ item.cnt }}</div>
              </div>
            </template>
          </el-autocomplete>
        </div>
      </div>
      <!-- 下半部分 -->
      <div class="navBottom">
        <div class="routerItem">
          <router-link @click.native="clearIptVal" to="/" class="routerItem_active">视频</router-link>
        </div>
        <el-divider direction="vertical"></el-divider>
        <div class="routerItem">
          <router-link to="/mobile/list">播放列表</router-link>
        </div>
      </div>
    </div>

    <!-- 热门标签栏,同时禁用滚动层 -->
    <div
      name="el-fade-in-linear"
      v-show="showHotTags"
      class="hotTags"
      @click.self="hide"
      @touchmove.prevent
      @mousewheel.prevent
    >
      <h3 v-if="ifSearch">相关标签</h3>
      <h3 v-else>热门标签:</h3>
      <ul>
        <li class="tag belong-to-home" v-for="(val, key) in tags" :key="key">
          <p
            v-bind:class="{
              Copyright: val == 'Copyright',
              Language: val == 'Language',
              Character: val == 'Character',
              Author: val == 'Author',
              General: val == 'General',
              Meta: val == 'Meta'
            }"
            @click="searchTags(key)"
          >{{ key }}</p>
        </li>
      </ul>
    </div>

    <!-- 侧边栏 -->
    <el-drawer
      :with-header="false"
      :visible.sync="myInfo"
      direction="ltr"
      size="70%"
      class="drawer"
    >
      <!-- 未登录状态下 -->
      <div v-if="!login">
        <el-avatar :size="70" :src="userAvatar" class="drawer_avatar"></el-avatar>
        <router-link class="drawer_username" @click.native="toLogin()" to="/mobile/login">请先登录</router-link>
      </div>
      <!-- 登录状态下 -->
      <div v-else>
        <el-avatar :size="70" :src="userAvatar" class="drawer_avatar"></el-avatar>
        <p class="drawer_username">{{this.$store.state.username}}</p>
        <p class="drawerItem" @click="dialogVisible = true">退出登录</p>
      </div>
    </el-drawer>

    <!-- 退出登录的弹出框 -->
    <el-dialog title="提示" :visible.sync="dialogVisible" width="90%" v-loading="loading">
      <p>你确定要退出登录吗?</p>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="cleanLocalStorage">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 搜索框的内容，不知道为什么在自动补全之后会被清空
      iptVal: "",
      // 搜索框的内容，在自动补全的时候作为备份使用，防止搜索框内容被清空
      // ps：iptVal2在计算属性里，所以请勿随便更改变量名
      iptVal3: "",
      // 进行搜索的时候关键字的开头位置(起始位置)
      startlocation: 0,
      // 进行搜索的时候光标的位置(终止位置)
      endlocation: 0,
      // 网站推荐栏以及关键字推荐栏
      sites: [
        { tag: "site:acfun", cat: 6, cnt: null },
        { tag: "site:bilibili", cat: 6, cnt: null },
        { tag: "site:nicovideo", cat: 6, cnt: null },
        { tag: "site:twitter", cat: 6, cnt: null },
        { tag: "site:youtube", cat: 6, cnt: null },
        { tag: "site:ipfs", cat: 6, cnt: null },
        { tag: "AND", cat: 6, cnt: null },
        { tag: "OR", cat: 6, cnt: null },
        { tag: "NOT", cat: 6, cnt: null },
        { tag: "date:", cat: 6, cnt: null }
      ],
      // 是否登录成功的标志
      login: false,
      // 侧边栏打开的标志
      myInfo: false,
      // 热门标签显示的标志
      showHotTags: false,
      // 退出登录时退出框处于加载状态的判断
      loading: false,
      // 控制退出登录的弹出框
      dialogVisible: false
    };
  },
  computed: {
    // 搜索的关键字
    iptVal2() {
      return this.$store.state.TopNavbarSearching;
    },
    // 搜索的关键字
    query() {
      if (this.$route.query.keyword != undefined) {
        return this.$route.query.keyword;
      } else {
        return "";
      }
    },
    // 网站是否出于搜索界面
    ifSearch() {
      if (this.$route.query.keyword != undefined) {
        return true;
      } else {
        return false;
      }
    },
    // 用户头像
    userAvatar() {
      if (this.$store.state.userAvatar == "default") {
        return "https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png";
      } else {
        return "be/images/userphotos/" + this.$store.state.userAvatar;
      }
    }
  },
  props: ["tags"],
  created() {
    // 查看是否在别的设备上登录过
    if (this.$store.state.ifTruelyLogin == 0) {
      this.checkUser();
    }
    // 查看是否登录
    if (
      JSON.stringify(this.$store.state.username) != "null" &&
      this.$store.state.username != ""
    ) {
      this.login = true;
    }
    // 判断是否需要搜索
    if (this.query != "") {
      this.iptVal = this.query;
    }
    this.getCookie();
  },
  methods: {
    // 登录跳转
    toLogin() {
      this.$store.commit("changeifRouter", "0");
    },
    //清除cookie
    clearCookie: function() {
      this.setCookie("", -1);
      this.setCookie("session", -1);
      this.setCookie("userAvatar", -1);
    },
    // 设置cookie
    setCookie(username, days) {
      var date = new Date(); //获取时间
      date.setTime(date.getTime() + 24 * 60 * 60 * 1000 * days); //保存的天数
      //字符串拼接cookie
      window.document.cookie =
        "username" + ":" + username + ";path=/;expires=" + date.toGMTString();
      window.document.cookie =
        "userAvatar" + "=" + username + ";path=/;expires=" + date.toGMTString();
    },
    // 获取cookie
    getCookie: function() {
      if (document.cookie.length > 0) {
        var arr = document.cookie.split("; ");
        for (var i = 0; i < arr.length; i++) {
          var arr3 = arr[i].split("=");
          //判断查找相对应的值
          if (arr3[0] == "userAvatar") {
            this.$store.commit("getUserAvatar", arr3[1]);
          }
          var arr2 = arr[i].split(":");
          //判断查找相对应的值
          if (arr2[0] == "username") {
            if (arr2[1] != "") {
              this.login = true;
              this.$store.commit("getUserName", arr2[1]);
            }
          }
        }
        return true;
      }
      this.$store.commit("getUserName", "");
      return false;
    },
    // 退出时清除所有数据
    cleanLocalStorage() {
      this.loading = true;
      this.axios({
        method: "post",
        url: "/be/logout.do",
        data: {}
      }).then(result => {
        this.login = false;
        // 清除所有session值(退出登录)
        sessionStorage.clear();
        // 清除用户名
        this.$store.commit("clearUserName");
        // 清除本地数据
        localStorage.setItem("username", "");
        // 清除cookie
        this.clearCookie();
        // 刷新界面
        location.reload();
        this.loading = false;
        this.dialogVisible = false;
      });
    },
    // 测试用户的登录状态
    checkUser() {
      this.axios({
        method: "post",
        url: "be/user/whoami",
        data: {}
      }).then(result => {
        if (result.data.data == "UNAUTHORISED_OPERATION" && this.getCookie()) {
          this.login = false;
          // 清除所有session值(退出登录)
          sessionStorage.clear();
          // 清除用户名
          this.$store.commit("clearUserName");
          // 清除本地数据
          localStorage.setItem("username", "");
          // 清除cookie
          this.clearCookie();
          // 改变用户登录状态
          this.$store.commit("changeifTruelyLogin", "2");
        } else {
          this.$store.commit("changeifTruelyLogin", "1");
        }
      });
    },
    // 清除搜索数据
    clearIptVal() {
      this.iptVal = "";
    },
    // 点击搜索按钮使home页面显示搜索结果
    gotoHome() {
      this.showHotTags = false;
      if (this.iptVal != "") {
        this.$router
          .push({ path: "/mobile/home", query: { keyword: this.iptVal } })
          .catch(err => {
            return err;
          });
      } else {
        // 对于在home页面时无参数搜索的兼容
        if (JSON.stringify(this.$route.query) == "{}") return;
        this.$router.push({ path: "/mobile/home" });
      }
    },
    // 点击标签显示搜索结果
    searchTags(tags) {
      this.iptVal = tags;
      this.showHotTags = false;
      this.$router
        .push({ path: "/mobile/home", query: { keyword: tags } })
        .catch(err => {
          return err;
        });
    },
    // --------------------------------------------------危险提示--------------------------------------------------
    //                                   此函数因为直接操纵dom可能导致网站受到攻击!
    // --------------------------------------------------危险提示--------------------------------------------------
    // 消息补全框的方法
    querySearchAsync(queryString, cb) {
      // 这里的get(0)是将jq对象转换为原生js对象
      // selectionStart是获取光标当前位置
      var endlocation = $("#ipt").get(0).selectionStart;
      // 切割输入框内的字符串，切割下光标左面的字符串
      var query = queryString.slice(0, endlocation);
      // 获取所需要搜索的字符串的开头在搜索框内字符串的位置
      var startlocation = this.match(query);
      // 切割下所需要查询的字符串
      query = query.slice(startlocation, endlocation);
      // 字符串为空格的话不搜索
      if (this.isNull(query)) {
        cb([]);
        return;
      }

      // 备份参数防止出现玄学问题
      var query2 = query;
      // 搜索是否包含sites变量的关键字
      var results = this.sites.filter(this.createFilter(query2));

      // 对输入框现在的数据进行备份
      this.iptVal3 = this.iptVal;
      this.startlocation = startlocation;
      this.endlocation = endlocation;

      var url = "/autocomplete/?q=" + query;
      this.axios({
        method: "get",
        url: url
      }).then(result => {
        if (result.status == "FALIED") {
          cb([]);
          return;
        }
        var resultList = results.concat(result.data);
        cb(resultList);
      });
    },
    // 搜索输入框内的搜索文字是否包含网站内容
    createFilter(query) {
      return sites => {
        return sites.tag.toLowerCase().indexOf(query.toLowerCase()) === 0;
      };
    },
    // 搜索输入框内的搜索文字，返回搜索关键字所在的起始位置
    match(text) {
      var i = text.length;
      while (i--) {
        if (
          text.charAt(i) == " " ||
          text.charAt(i) == "\t" ||
          text.charAt(i) == "\n" ||
          text.charAt(i) == "\v" ||
          text.charAt(i) == "\f" ||
          text.charAt(i) == "\r" ||
          // 把括号转化成ascII码判断,否则谜之报错
          text.charAt(i).charCodeAt() == 41
        ) {
          return i + 1;
        } else if (text.charAt(i).charCodeAt() == 40) {
          if (i > 0 && text.charAt(i - 1) == "_") {
            continue;
          } else {
            return i + 1;
          }
        }
      }
      return 0;
    },
    // 判断字符串是否全为空格
    isNull(str) {
      if (str == "") return true;
      var regu = "^[ ]+$";
      var re = new RegExp(regu);
      return re.test(str);
    },
    handleSelect(item) {
      // 切割字符串，并在中间加入搜索到的标签拼接成新的输入框的内容
      var iptVal1 = this.iptVal3.slice(0, this.startlocation);
      var iptVal2 = this.iptVal3.slice(this.endlocation);
      var iptVal = iptVal1 + item.tag + " " + iptVal2;
      this.iptVal = iptVal;
      // 光标设置焦点事件
      var endlocation = $("#ipt").focus();
      this.infoTipMark = true;
    }
  },
  components: {}
};
</script>

<style scoped>
.nav {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.12), 0 0 6px rgba(0, 0, 0, 0.04);
}
.navTop {
  width: 100%;
  height: 40px;
  background-color: rgb(255, 255, 255);
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px rgba(0, 0, 0, 0.158) solid;
}
.avatar {
  margin: 7px 5px 5px 5px;
}
.cancelSearch {
  color: #606266;
}
.navSearch {
  height: 30px;
  flex: 0 0 70%;
  margin-right: 5px;
}
.navBottom {
  width: 100%;
  height: 22px;
  background-color: rgb(255, 255, 255);
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: space-around;
}
.routerItem {
  flex: 0 0 calc(50% - 29px);
  color: #909399;
  font-size: 15px;
  margin: 5px 5px 5px 5px;
}
.routerItem_active {
  border-bottom: 2px solid;
  border-bottom-color: #40a0ffad;
  color: #409eff;
}

.hotTags {
  width: 100%;
  min-height: 100%;
  overflow-y: scroll;
  position: absolute;
  left: 0;
  top: 40px;
  z-index: 998;
  background-color: rgba(255, 255, 255, 0.938);
  text-align: left;
  padding-left: 10px;
  padding-top: 10px;
}
.belong-to-home p {
  display: inline;
  font-size: 18px;
  line-height: 25px;
}

.drawer {
  display: flex;
  text-align: left;
  flex-wrap: wrap;
}
.drawer_avatar {
  margin: 20px auto 20px 20px;
}
.drawer_username {
  font-size: 30px;
  display: block;
  margin-left: 10px;
  color: #409eff;
}
.drawerItem {
  font-size: 20px;
  color: #303133;
  margin-left: 10px;
  margin-top: 5px;
}

.adviceList {
  /* 针对webkit内核（如Safari）进行的调整 */
  display: -webkit-flex;
  display: flex;
}
.highlighted .addr {
  color: #ddd;
}
.name {
  flex: 0 0 80%;
  font-size: 17px;
  line-height: 200%;
  white-space: normal;
  word-break: break-all;
  overflow: hidden;
  text-align: left;
}
.addr {
  flex: 0 0 20%;
  line-height: 200%;
  font-size: 15px;
  color: #b4b4b4;
  text-align: right;
}
/* 针对tag类别调整颜色 */
.Copyright {
  color: #a0a;
}
.Language {
  color: #585455;
}
.Character {
  color: #0a0;
}
.Author {
  color: #a00;
}
.General {
  color: #0073ff;
}
.Meta {
  color: #f80;
}
</style>