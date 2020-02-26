<!--    vue页面：SignUp_mobile.vue     -->
<!--
    页面：paychyvideo的注册页面
    功能：用户由此注册账号
    更新日志：
    2/15/2020:
      release
-->
<template>
  <div class="signupPic" v-loading="loading">
    <!-- 背景图片 -->
    <div class="bckimg"></div>

    <!-- 注册框正文 -->
    <div class="w">
      <!-- 标题 -->
      <h1>
        <router-link class="title" to="/home">PatchyVideo</router-link>
      </h1>
      <div class="top in">
        <router-link to="/signUp">注册</router-link>
      </div>

      <!-- 输入账号和密码的框 -->
      <el-form
        ref="signupFormRef"
        :model="signupFormRef"
        class="middle in"
        status-icon
        :rules="rules"
      >
        <el-form-item prop="signup_username" class="signupInput">
          <el-input
            id="username"
            name="username"
            v-model="signupFormRef.signup_username"
            placeholder="请输入用户名"
            clearable
            prefix-icon="el-icon-user-solid"
          ></el-input>
        </el-form-item>
        <el-form-item prop="signup_password1" class="signupInput">
          <el-input
            id="password1"
            name="password1"
            type="password"
            v-model="signupFormRef.signup_password1"
            placeholder="请输入密码"
            prefix-icon="el-icon-lock"
          ></el-input>
        </el-form-item>
        <el-form-item prop="signup_password2" class="signupInput">
          <el-input
            id="password2"
            name="password2"
            type="password"
            v-model="signupFormRef.signup_password2"
            placeholder="请重复密码"
            prefix-icon="el-icon-key"
          ></el-input>
        </el-form-item>
        <el-form-item prop="signup_email" class="signupInput">
          <el-input
            id="email"
            name="email"
            type="email"
            v-model="signupFormRef.signup_email"
            clearable
            placeholder="Email"
            prefix-icon="el-icon-message"
          ></el-input>
        </el-form-item>
        <p id="status" style="text-align: center;" v-bind:class="{alert:status!='就绪'}">{{ status }}</p>
      </el-form>

      <!-- 注册按钮 -->
      <div class="bottom in">
        <div class="login in" @click="signup">注册</div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    // 校验用户名是否已经存在
    var checkUsername = (rule, value, callback) => {
      this.axios({
        method: "post",
        url: "be/user/exists.do",
        data: {
          username: value
        }
      }).then(result => {
        if (result.data.data == true) {
          callback(new Error("该用户名已存在！"));
        } else {
          callback();
        }
      });
    };
    // 校验两次输入密码是否一致
    var validatePass2 = (rule, value, callback) => {
      if (value !== this.signupFormRef.signup_password1) {
        callback(new Error("两次输入密码不一致!"));
      } else {
        callback();
      }
    };
    return {
      // 用户账户信息
      signupFormRef: {
        signup_username: "",
        signup_password1: "",
        signup_password2: "",
        signup_email: ""
      },
      // 事先向服务器请求的session值
      session: "",
      rules: {
        signup_username: [
          { required: true, message: "请输入账号", trigger: "blur" },
          { validator: checkUsername, trigger: "blur" },
          { min: 2, max: 32, message: "长度在 2 到 32 个字符", trigger: "blur" }
        ],
        signup_password1: [
          { required: true, message: "请输入密码", trigger: "blur" },
          { min: 6, max: 64, message: "长度在 6 到 64 个字符", trigger: "blur" }
        ],
        signup_password2: [
          { required: true, message: "请重复密码", trigger: "blur" },
          { validator: validatePass2, trigger: "blur" },
          { min: 6, max: 64, message: "长度在 6 到 64 个字符", trigger: "blur" }
        ],
        signup_email: [
          { required: false, message: "请输入邮箱", trigger: "blur" },
          { type: "email", message: "请输入正确的邮箱地址", trigger: ["blur"] }
        ]
      },
      // 登录状态
      status: "就绪",
      // 视频列表是否属于加载状态的判断
      loading: false
    };
  },
  created() {
    // 初始化页面名为signup
    this.$store.commit("changeBgc", "signup");
    // 修改网站标题
    document.title = "注册 - Patchyvideo";
    console.log(
      "原图P站ID:44001544, 如有侵权请联系开发人员(本站账号: admin)删除"
    );
  },
  methods: {
    open2() {
      this.$message({
        message: "注册成功",
        type: "success"
      });
    },

    open3() {
      this.$message({
        message: "该用户名已存在！",
        type: "warning"
      });
    },

    open4() {
      this.$message({
        message: "未知错误",
        type: "warning"
      });
    },

    // 用户注册
    signup: function() {
      // 先使页面出于加载状态
      this.loading = true;

      // 表单验证
      this.$refs.signupFormRef.validate(valid => {
        if (valid) {
          // 验证成功，先获取session
          this.axios({
            method: "post",
            url: "be/auth/get_session.do",
            data: {
              type: "SIGNUP"
            }
          }).then(result => {
            this.session = result.data.data;

            // 请求登录
            this.axios({
              method: "post",
              url: "be/signup.do",
              data: {
                username: this.signupFormRef.signup_username,
                password: this.signupFormRef.signup_password1,
                email: this.signupFormRef.signup_email,
                session: this.session
              }
            }).then(result => {
              if (result.status == 200) {
                if (result.data.status == "SUCCEED") {
                  this.open2();
                  // 加载结束,加载动画消失
                  this.loading = false;
                  // 退回到登录界面
                  this.$router.push("/login");
                }
                // 用户名已存在的情况
                else {
                  var reason = result.data.data.reason;
                  if (reason == "USER_EXIST") {
                    this.open3();
                  } else {
                    this.open4();
                  }
                  this.loading = false;
                }
              } else {
                this.status = "网络异常";
              }
            });
          });
        } else {
          this.status = "填写格式不正确！";
          // 加载结束,加载动画消失
          this.loading = false;
          return false;
        }
      });
    },
    // 设置cookie
    // 储存变量为username
    setCookie(username, days) {
      var date = new Date(); //获取时间
      date.setTime(date.getTime() + 24 * 60 * 60 * 1000 * days); //保存的天数
      //字符串拼接cookie
      window.document.cookie =
        "username" + ":" + username + ";path=/;expires=" + date.toGMTString();
    }
  }
};
</script>

<style scoped>
.signupPic {
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
  /* background: url("../static/img/44001544.png"); */
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
  height: 420px;
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
a {
  text-decoration: none;
  color: #ff7792;
}
.w h1 {
  width: 100%;
  height: 60px;
  display: block;
  text-align: center;
}

.in {
  width: 100%;
}

.top {
  margin-bottom: 10px;
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
.login:hover {
  cursor: pointer;
  background: #ff7792;
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

.el-input {
  margin-top: 5px;
}
</style>