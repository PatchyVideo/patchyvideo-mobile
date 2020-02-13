<!--    vue页面：Home_mobile.vue     -->
<!--
    页面：paychyvideo-mobile的主页面
    功能：展示网站收录的所有视频/展示搜索结果
    包含组件：
    其他说明：
    更新日志：

    ★待解决问题：
      1.播放列表里链接的复制功能因为涉及到对dom的直接操作，所以可能会有被抓住漏洞的风险
-->
<template>
  <div class="home">
    <NavBar :tags="tags"></NavBar>

    <!-- 视频列表正文 -->
    <div class="content" v-loading="loading">
      <!-- 排序方式选择 -->
      <div class="selectBox">
        <el-select size="mini" style="width:100%" v-model="couponSelected" placeholder="请选择">
          <el-option
            v-for="item in options"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          ></el-option>
        </el-select>
      </div>
      <!-- 播放列表正文 -->
      <!-- 搜索关键字有错误的情况下 -->
      <h1 v-if="error">{{reason}}</h1>
      <!-- 没有的情况下 -->
      <ul class="videolist" v-else>
        <li class="list-item" v-for="item in listvideo" :key="item._id.$oid">
          <div class="video-thumbnail">
            <img :src="'/images/covers/' + item.item.cover_image" width="120px" height="75px" />
          </div>
          <div class="video-detail">
            <p class="video-detail-title">
              <router-link
                :to="{ path: '/video', query: { id: item._id.$oid } }"
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

      <!-- 分页器 -->
      <el-pagination
        v-if="!error"
        :hide-on-single-page="true"
        :page-size="20"
        :pager-count="5"
        layout="prev, pager, next"
        :total="count"
        @current-change="handleCurrentChange"
      ></el-pagination>

      <!-- 回到顶部 -->
      <el-backtop :right="20"></el-backtop>
    </div>
  </div>
</template>

<script>
import NavBar from "../components/NavBar_mobile";
export default {
  data() {
    return {
      // 请求到的视频列表
      listvideo: [],
      // 请求到的标签列表
      tags: {},
      // 一共请求到的页数
      page: 1,
      // 每一页的视频数
      page_size: 20,
      // 视频总数
      count: 0,
      // 视频列表的排序规则
      options: [
        { value: "latest", label: "发布时间正序" },
        { value: "oldest", label: "发布时间倒序" },
        { value: "video_latest", label: "原视频上传时间正序" },
        { value: "video_oldest", label: "原视频上传时间倒序" }
      ],
      // 当前视频列表的排列顺序
      couponSelected: "latest",
      // 视频列表是否属于加载状态的判断
      loading: false,
      // 页面是否显示搜索结果的判断
      ifSearch: false,
      // 搜索内容是否有问题的判断
      error: false,
      // 错误原因
      reason: ""
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
    },
    // 搜索的关键字
    query() {
      if (this.$route.query.keyword != undefined) {
        return this.$route.query.keyword;
      } else {
        return "";
      }
    }
  },
  created() {
    // 初始化页面名为home
    this.$store.commit("changeBgc", "home");
    // 修改网站标题
    document.title = "Patchyvideo";
    // 获取视频列表
    this.getListVideo();
  },
  mounted() {},
  methods: {
    // 当前播放列表的页面切换的时候调用
    handleCurrentChange(val) {
      this.page = val;
      this.getListVideo();
    },
    // 请求播放列表数据
    getListVideo() {
      // 先使页面出于加载状态
      this.loading = true;

      // 如果有搜索显示搜索结果
      if (this.ifSearch) {
        // 请求数据
        this.axios({
          method: "post",
          url: "/be/queryvideo.do",
          data: {
            page: this.page,
            page_size: this.page_size,
            order: this.couponSelected,
            query: this.query
          }
        }).then(result => {
          if (result.data.status == "SUCCEED") {
            this.error = false;
            this.listvideo = result.data.data.videos;
            this.count = result.data.data.count;
            this.tags = result.data.data.tags;
          } else {
            // 包含非法字符的时候
            if (result.data.data.reason == "INCORRECT_QUERY") {
              this.error = true;
              this.reason = "查询语法错误！";
            }
            // NOT使用错误的时候
            else if (result.data.data.reason == "FAILED_NOT_OP") {
              this.error = true;
              this.reason = "所输入的查询不能与NOT连用！";
            }
          }
          // 加载结束,加载动画消失
          this.loading = false;

          // 回到顶部
          if ($("html").scrollTop()) {
            //动画效果
            $("html").animate({ scrollTop: 0 }, 100);
          }
        });
      }
      // 否则显示全部列表
      else {
        // 请求数据
        this.axios({
          method: "post",
          url: "/be/listvideo.do",
          data: {
            page: this.page,
            page_size: this.page_size,
            order: this.couponSelected
          }
        }).then(result => {
          this.listvideo = result.data.data.videos;
          this.count = result.data.data.count;
          this.tags = result.data.data.tags;
          // 加载结束,加载动画消失
          this.loading = false;

          // 回到顶部
          if ($("html").scrollTop()) {
            //动画效果
            $("html").animate({ scrollTop: 0 }, 100);
          }
        });
      }
    }
  },
  watch: {
    couponSelected() {
      this.page = 1;
      this.getListVideo();
    },
    $route(newV, oldV) {
      this.page = 1;
      //监听路由query的值，当query的值为空时，说明默认是首页，调用this.getListVideo获取首页数据并渲染。
      if (JSON.stringify(this.$route.query) == "{}") {
        this.ifSearch = false;
        this.getListVideo();
        return;
      }
      //监听路由query的值，当用户连续输入的搜索值不一样时，更新搜索关键词，调用 this.getSearchData获取搜索数据并渲染。
      if (newV.query.keyword != oldV.query.keyword) {
        // 修改网站标题
        document.title = " 搜索结果- " + newV.query.keyword;
        this.ifSearch = true;
        this.getListVideo();
        return;
      }
    }
  },
  components: { NavBar }
};
</script>

<style scoped>
.home {
  width: 100%;
  background-color: rgba(95, 95, 95, 0.014);
}
.content {
  min-height: 500px;
  width: 95%;
  margin: 0 auto;
}
.selectBox {
  width: 100%;
  height: 30px;
  margin-top: 3px;
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
