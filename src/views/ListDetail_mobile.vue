<!--    vue页面：ListDetail_mobile.vue     -->
<!--
    组件：网站的列表详情页面
    功能：展示视频列表的详细信息
    更新日志：
      2/1/2020: v1.0 
      release
    ★待解决问题：
      暂无
-->

<template>
  <div style="height:100%">
    <!-- 页头 -->
    <div class="head">
      <div class="goBack" @click="goBack()">
        <i class="el-icon-back"></i>返回
      </div>
      <el-divider direction="vertical"></el-divider>列表详情 - Patchyvideo
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {};
  },
  created() {},
  methods: {
    // 返回上一页
    goBack() {
      this.$router.go(-1);
    }
  },
  components: {}
};
</script>

<style scoped>
.head {
  position: absolute;
  top: 0;
  z-index: 998;
  width: 100%;
  height: 40px;
  display: flex;
  align-items: center;
  background-color: #00000002;
  box-shadow: 0 5px 5px 0 rgba(0, 0, 0, 0.1);
}
.goBack {
  margin-left: 10px;
}
</style>