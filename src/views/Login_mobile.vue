<!--    vue页面：Login.vue     -->
<!--
    页面：paychyvideo的登录页面
    功能：用户由此登录网站
    更新日志：
      2/15/2020:
        release
    ★待解决问题：
      暂无
-->
<template>
  <div class="loginPic" v-loading="loading">
    <!-- 背景图片 -->
    <div class="bckimg"></div>
    <!-- 登录框正文 -->
    <div class="w">
      <!-- 标题 -->
      <router-link class="title" to="/mobile/home">PatchyVideo</router-link>
      <div class="top in">
        <router-link to="/mobile/login">登录</router-link>
      </div>

      <!-- 输入账号和密码的框 -->
      <el-form ref="loginFormRef" :model="loginFormRef" class="middle in" :rules="rules">
        <el-form-item prop="login_name">
          <el-input
            id="username"
            name="username"
            placeholder="用户名"
            v-model="loginFormRef.login_name"
            clearable
            prefix-icon="el-icon-user"
          ></el-input>
        </el-form-item>
        <el-form-item prop="login_password">
          <el-input
            id="password"
            name="password"
            placeholder="密码"
            v-model="loginFormRef.login_password"
            show-password
            prefix-icon="el-icon-lock"
            @keyup.enter.native="login"
          ></el-input>
        </el-form-item>
        <p id="status" style="text-align: center;" v-bind:class="{alert:status!='就绪'}">{{ status }}</p>
      </el-form>

      <!-- 登录按钮 -->
      <div class="bottom in">
        <div @click="login" class="login in">登录</div>
        <div @click="signUp" class="login in">注册</div>
      </div>
    </div>
  </div>
</template>

<script>
import signup from "../views/SignUp";
export default {
  data() {
    return {
      // 用户信息
      loginFormRef: {
        login_name: "",
        login_password: ""
      },
      // 事先向服务器请求的session值
      session: "",
      // 表单验证规则
      rules: {
        login_name: [
          { required: true, message: "请输入账号", trigger: "blur" },
          { min: 4, max: 32, message: "长度在 4 到 32 个字符", trigger: "blur" }
        ],
        login_password: [
          { required: true, message: "请输入密码", trigger: "blur" },
          { min: 6, max: 64, message: "长度在 6 到 64 个字符", trigger: "blur" }
        ]
      },
      // 登录状态
      status: "就绪",
      // 视频列表是否属于加载状态的判断
      loading: false
    };
  },
  created() {
    // 初始化页面名为login
    this.$store.commit("changeBgc", "login");
    // 修改网站标题
    document.title = "登录 - Patchyvideo";
    console.log(
      "原图P站ID:53270459, 如有侵权请联系开发人员(本站账号: admin)删除"
    );
  },
  mounted() {},
  methods: {
    open2() {
      this.$message({
        message: "登录成功",
        type: "success"
      });
    },

    open3() {
      this.$message({
        message: "登录失败",
        type: "warning"
      });
    },
    // 用户注册
    signUp() {
      this.$router.push({ path: "/mobile/signUp" });
    },
    // 用户登录
    login: function() {
      // 先使页面出于加载状态
      this.loading = true;

      // 表单验证
      this.$refs.loginFormRef.validate(valid => {
        if (valid) {
          // 验证成功，先获取session
          this.axios({
            method: "post",
            url: "be/auth/get_session.do",
            data: {
              type: "LOGIN"
            }
          })
            .then(result => {
              this.session = result.data.data;

              // 请求登录
              this.axios({
                method: "post",
                url: "be/login.do",
                data: {
                  username: this.loginFormRef.login_name,
                  password: this.loginFormRef.login_password,
                  session: this.session
                }
              })
                .then(result => {
                  if (result.status == 200) {
                    if (result.data.status == "SUCCEED") {
                      // this.open2();
                      this.$store.commit(
                        "getUserName",
                        this.loginFormRef.login_name
                      );
                      this.$store.commit(
                        "getUserAvatar",
                        result.data.data.image
                      );
                      // 加载结束,加载动画消失
                      this.loading = false;
                      // 利用cookie储存登录状态
                      this.setCookie(
                        this.loginFormRef.login_name,
                        result.data.data.image,
                        7
                      );
                      // 如果是从登录按钮跳转到本界面，回到上一个页面
                      if (this.$store.state.ifRouter == 0) {
                        this.$store.commit("changeifRouter", "2");
                        this.$router.go(-1);
                      }
                      // 如果是从路由守卫跳转到本界面，进入下一个页面
                      else if (this.$store.state.ifRouter == 1) {
                        this.$store.commit("changeifRouter", "2");
                        var path = this.$store.state.routerPath;
                        var query = this.$store.state.routerparams;
                        // 因为发布视频有参数传入的可能,所以做特别的兼容性调整
                        if (path == "/postvideo") {
                          this.$router.push({ path: path, query: query });
                        } else {
                          this.$router.push({ path: path });
                        }
                      }
                      // 如果是从其他地方跳转到本界面，回到home页面
                      else {
                        this.$store.commit("changeifRouter", "2");
                        this.$router.push({ path: "/mobile/home" });
                      }
                    } else {
                      this.open3();
                      this.loading = false;
                    }
                  } else {
                    this.status = "请求失败";
                  }
                })
                .catch(error => {
                  this.loading = false;
                  // this.open3();
                  this.status = "网络错误！";
                });
            })
            .catch(error => {
              this.loading = false;
              // this.open3();
              this.status = "网络错误！";
            });
        } else {
          this.status = "error submit!!";
          // 加载结束,加载动画消失
          this.loading = false;
          return false;
        }
      });
    },
    // 设置cookie
    // 储存变量为username,userAvatar
    setCookie(username, userAvatar, days) {
      var date = new Date(); //获取时间
      date.setTime(date.getTime() + 24 * 60 * 60 * 1000 * days); //保存的天数
      //字符串拼接cookie
      window.document.cookie =
        "username" + ":" + username + ";path=/;expires=" + date.toUTCString();
      window.document.cookie =
        "userAvatar" +
        "=" +
        userAvatar +
        ";path=/;expires=" +
        date.toUTCString();
    }
  },
  components: { signup }
};
</script>

<style scoped>
.loginPic {
  height: 100%;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.bckimg {
  position: absolute;
  width: 100%;
  height: 100%;
  background: url("../static/img/53270459.jpg");
  background-size: cover;
  background-attachment: fixed;
  background-position: center center;
  z-index: 1;
  -webkit-filter: blur(1px);
  -moz-filter: blur(1px);
  -o-filter: blur(1px);
  -ms-filter: blur(1px);
  filter: blur(1px);
}
.alert {
  font-size: 20px;
  font-weight: 800;
  color: rgb(255, 218, 6);
}

.w {
  display: block;
  width: 80%;
  max-width: 320px;
  height: 100%;
  padding: 20px;
  background-color: rgba(255, 255, 255, 0);
  z-index: 100;
}
.title {
  font-size: 30px;
  font-weight: 800;
  color: #ff7792;
  width: 100%;
  height: 60px;
  display: block;
  text-align: center;
}

.in {
  width: 100%;
  max-width: 300px;
}

.top {
  width: 100%;
  margin-bottom: 50px;
  text-align: center;
}
.top a {
  font-weight: 400;
  color: #969696;
}

.top b {
  margin: 0px 10px 0px;
  font-size: 10px;
}

.middle input {
  padding-left: 10px;
  width: 100%;
  height: 50px;
  cursor: text;
  font-size: 14px;
  color: #646257;
  border: 1px solid #c8c8c8;
  background-color: hsla(0, 0%, 71%, 0.1);
}

.login {
  padding: 0px 5px;
  margin: 20px 0px 10px;
  height: 50px;
  line-height: 50px;
  text-align: center;
  font-size: 18px;
  border-radius: 25px;
  color: #fff;
  background: #ff99ad;
}

p {
  margin: 10px 0;
  padding: 0;
  text-align: center;
  font-size: 12px;
  line-height: 20px;
  color: #969696;
}

.last {
  margin: auto;
  margin-top: 50px;
  height: 50px;
  width: 250px;

  border-top: 1px solid #c8c8c8;
}
.last p {
  display: block;
  margin: auto;
  width: 100px;
  padding: 10px;
  background-color: #fff;
  margin-top: -80px;
}

i {
  font-style: normal;
}
.el-form-item {
  margin-top: 30px;
}
</style>