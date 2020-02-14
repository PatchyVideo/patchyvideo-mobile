<!--    vue组件：NavBar_list_mobile.vue     -->
<!--
    页面：paychyvideo-mobile的导航栏
    大小：100% * 64px
    功能：播放列表页面顶端的导航栏
    必要传入参数：暂无
    其他说明：
    更新日志：
      1.release
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
        <div class="navSearch">
          <el-input v-model="iptVal" placeholder="搜索什么播放列表呢" size="mini">
            <el-button slot="append" icon="el-icon-search" @click="gotoHome"></el-button>
          </el-input>
        </div>
      </div>
      <!-- 下半部分 -->
      <div class="navBottom">
        <div class="routerItem">
          <router-link @click.native="clearIptVal" to="/">视频</router-link>
        </div>
        <el-divider direction="vertical"></el-divider>
        <div class="routerItem">
          <router-link to="/mobile/list" class="routerItem_active">播放列表</router-link>
        </div>
      </div>
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
      // 搜索框的内容
      iptVal: "",
      // 是否登录成功的标志
      login: false,
      // 侧边栏打开的标志
      myInfo: false,
      // 退出登录时退出框处于加载状态的判断
      loading: false,
      // 控制退出登录的弹出框
      dialogVisible: false
    };
  },
  computed: {
    // 用户头像
    userAvatar() {
      if (this.$store.state.userAvatar == "default") {
        return "https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png";
      } else {
        return "be/images/userphotos/" + this.$store.state.userAvatar;
      }
    }
  },
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
          .push({ path: "/mobile/list", query: { keyword: this.iptVal } })
          .catch(err => {
            return err;
          });
      } else {
        // 对于在home页面时无参数搜索的兼容
        if (JSON.stringify(this.$route.query) == "{}") return;
        this.$router.push({ path: "/mobile/home" });
      }
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