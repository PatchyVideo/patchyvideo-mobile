<!--    vue页面：Detail_mobile.vue     -->
<!--
    组件：网站的视频详情页面
    功能：显示视频的详细信息
    更新日志：
    2/1/2020: v1.0 
      release
-->

<template>
  <div v-loading="loading">
    <!-- 页头 -->
    <div class="head">
      <el-page-header @back="goBack" :content="myVideoData.video.item.title"></el-page-header>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 视频的详细信息
      myVideoData: {
        // 视频的副本列表
        copies: [],
        // 视频的播放列表
        playlists: [],
        // 视频的标签列表(已分类)
        tag_by_category: {},
        // 视频的标签列表(未分类)
        tags: [],
        video: {
          item: {
            // 视频的标题
            title: "视频详情",
            // 视频介绍
            desc: "",
            // 视频上传时间(时间戳对象)
            upload_time: {
              $date: ""
            },
            // 视频的链接
            url: "",
            //视频封面
            cover_image: ""
          }
        }
      },
      // 视频列表是否属于加载状态的判断
      loading: false
    };
  },
  created() {
    this.searchVideo();
  },
  methods: {
    // 返回上一页
    goBack() {
      this.$router.go(-1);
    },
    // 查询视频详细信息
    searchVideo: function() {
      this.loading = true;

      // 直接向后端请求视频数据
      this.axios({
        method: "post",
        url: "be/getvideo.do",
        data: { vid: this.$route.query.id }
      })
        .then(result => {
          this.myVideoData = result.data.data;

          // 修改网站标题
          document.title = this.myVideoData.video.item.title;
          this.pid = this.myVideoData.video._id.$oid;
          // 视频pid储存到vuex中
          this.$store.commit("setVideoPid", this.myVideoData.video._id.$oid);
          // 加载结束,加载动画消失
          this.loading = false;
        })
        .catch(error => {
          this.$router.push({ path: "/404" });
        });
    }
  },
  components: {}
};
</script>

<style scoped>
.head {
  width: 100%;
  height: 40px;
  display: flex;
  align-items: center;
  /* justify-content: center; */
}
</style>