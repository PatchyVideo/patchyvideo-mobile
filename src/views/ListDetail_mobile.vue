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
    <PageHead what="列表"></PageHead>

    <div class="content" v-loading="loading">
      <!-- 列表封面 -->
      <el-image :src="'/images/covers/' +videolistDetail.playlist.cover">
        <div slot="placeholder" class="image-slot">
          加载中
          <span class="dot">...</span>
        </div>
      </el-image>

      <!-- 列表内容 -->
      <div class="videoDesc">
        <div>
          <!-- 列表标题 -->
          <h3>{{videolistName}}</h3>
          <!-- 列表详情 -->
          <p class="desc">{{videolistDesc}}</p>
        </div>
      </div>

      <!-- 视频列表 -->
      <div class="List">
        <h3 class="listTitle" v-if="videolistVideos.length">共{{ maxcount }}个视频</h3>
        <h3 class="noVideo" v-else>竟然连一个视频都没有QAQ</h3>
        <ul class="videolist">
          <li class="list-item" v-for="item in videolistVideos" :key="item._id.$oid">
            <div class="rank">
              <p>{{ item.rank + 1 }}</p>
            </div>
            <div class="video-thumbnail">
              <img :src="'/images/covers/' + item.item.cover_image" width="120px" height="75px" />
            </div>
            <div class="video-detail">
              <p class="video-detail-title">
                <router-link
                  :to="{ path: '/mobile/detail', query: { id: item._id.$oid } }"
                >{{ item.item.title }}</router-link>
              </p>
              <div class="video-detail-desc">
                <a :href="item.item.url">
                  <img
                    :src="require('../static/img/' + item.item.site + '.png')"
                    width="11px"
                    style="margin-right:2px"
                  />打开原网址
                </a>
                <p style="margin-top:5px">{{ videodate(item.item.upload_time.$date) }}</p>
              </div>
            </div>
          </li>
        </ul>
      </div>
    </div>

    <!-- 分页器 -->
    <el-pagination
      :hide-on-single-page="true"
      :page-size="20"
      :pager-count="5"
      layout="prev, pager, next"
      :total="maxcount"
      :current-page="this.page"
      @current-change="handleCurrentChange"
    ></el-pagination>

    <!-- 回到顶部 -->
    <el-backtop :right="20"></el-backtop>
  </div>
</template>

<script>
import PageHead from "../components/PageHead";
export default {
  data() {
    return {
      // 视频列表的详细信息
      videolistDetail: {
        playlist: {
          cover: ""
        }
      },
      // 视频列表的名称
      videolistName: "",
      // 视频列表的介绍
      videolistDesc: "",
      // 视频列表里的视频
      videolistVideos: [],
      // 当前页数
      page: 1,
      // 全部分页数
      maxpage: 1,
      // 每一页的视频数量
      count: 20,
      // 视频的全部数量
      maxcount: 0,
      // 视频列表是否属于加载状态的判断
      loading: false,
      // 视频详情是否打开的判断
      descOpen: false
    };
  },
  computed: {
    // 视频的上传日期
    videodate() {
      return function(date) {
        var upload_time = new Date(date);
        // 设置为东八区的时间
        upload_time.setTime(upload_time.getTime() + 1000 * 3600 * 8);
        var y = upload_time.getFullYear(); //getFullYear方法以四位数字返回年份
        var M = upload_time.getMonth() + 1; // getMonth方法从 Date 对象返回月份 (0 ~ 11)，返回结果需要手动加一
        var d = upload_time.getDate(); // getDate方法从 Date 对象返回一个月中的某一天 (1 ~ 31)
        var h = upload_time.getHours(); // getHours方法返回 Date 对象的小时 (0 ~ 23)
        var m = upload_time.getMinutes(); // getMinutes方法返回 Date 对象的分钟 (0 ~ 59)
        var s = upload_time.getSeconds(); // getSeconds方法返回 Date 对象的秒数 (0 ~ 59)
        return (
          y +
          "-" +
          // 数字不足两位自动补零，下同
          (Array(2).join(0) + M).slice(-2) +
          "-" +
          (Array(2).join(0) + d).slice(-2) +
          " " +
          (Array(2).join(0) + h).slice(-2) +
          ":" +
          (Array(2).join(0) + m).slice(-2) +
          ":" +
          (Array(2).join(0) + s).slice(-2)
        );
      };
    }
  },
  created() {
    this.getVideoList();
  },
  methods: {
    // 当前播放列表的页面切换的时候调用
    handleCurrentChange(val) {
      this.page = val;
      this.getVideoList();
    },
    // 请求单个播放列表详细数据
    getVideoList() {
      // 先使页面出于加载状态
      this.loading = true;

      this.axios({
        method: "post",
        url: "be/lists/get_playlist.do",
        data: { page: this.page, page_size: 20, pid: this.$route.query.id }
      }).then(result => {
        // 请求失败的情况
        if (result.data.status == "FAILED") {
          // 列表不存在的情况,跳转到404页面
          if (result.data.data.reason == "PLAYLIST_NOT_EXIST") {
            this.$router.push({ path: "*" });
          }
        }
        // 页面不存在的情况下
        this.videolistDetail = result.data.data;
        // 必须是登录且发来的数据是可编辑的才渲染编辑组件
        this.videolistName = this.videolistDetail.playlist.title.english;
        this.videolistDesc = this.videolistDetail.playlist.desc.english;
        this.videolistVideos = this.videolistDetail.videos;
        this.maxcount = result.data.data.count;
        this.maxpage = result.data.data.page_count;

        // 加载结束,加载动画消失
        this.loading = false;

        // 回到顶部
        if ($("html").scrollTop()) {
          //动画效果
          $("html").animate({ scrollTop: 0 }, 100);
        }
      });
    }
  },
  components: { PageHead }
};
</script>

<style scoped>
.content {
  z-index: 10;
  margin-top: 37px;
  width: 100%;
  min-height: 100%;
}
.content .el-image {
  width: 100%;
  display: block;
  margin: 0 auto;
}

.videoDesc {
  font-size: 12px;
  word-wrap: break-word;
  white-space: pre-wrap;
  text-align: left;
  width: 90%;
  margin: 0 auto;
  margin-bottom: 5px;
}
.videoDesc h3 {
  width: 100%;
  margin: 0 auto;
  font-size: 22px;
  text-align: center;
  margin-bottom: 2px;
}
.desc {
  font-size: 15px;
}

.List {
  width: 95%;
  margin: 0 auto;
  text-align: left;
}
.listTitle {
  width: 100%;
  font-size: 18px;
  margin-bottom: 2px;
  border-bottom-style: solid;
  border-bottom-width: 1px;
  border-bottom-color: #21c6ef;
}
.noVideo {
  width: 100%;
  text-align: center;
  margin-top: 50px;
}
.videolist {
  margin-top: 2px;
  background-color: rgba(95, 95, 95, 0.014);
}
.list-item {
  height: 90px;
  background-color: rgb(255, 255, 255);
  margin-bottom: 5px;
  border-radius: 8px;
  box-shadow: 0 2px 5px 0 rgba(0, 0, 0, 0.1);
  display: flex;
}
.rank {
  height: 100%;
  min-width: 31.15px;
  font-size: 30px;
  color: rgb(98, 169, 231);
  display: -webkit-flex; /* Safari */
  display: flex;
  justify-content: center;
  align-items: center;
}
.video-thumbnail {
  margin-left: 3px;
  margin-top: 7.5px;
}
.video-detail {
  margin-left: 5px;
  margin-top: 7.5px;
  float: right;
  text-align: left;
}
.video-detail-title {
  height: 32px;
  font-size: 15px;
  font-weight: 800;
  line-height: 16px;
  /* 使文字变为最多显示2行，多余的使用省略号代替 */
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}
.video-detail-desc {
  margin-top: 8px;
}
.video-detail-desc a,
.video-detail-desc p {
  font-size: 13px;
  color: #7a7a7a;
}
</style>