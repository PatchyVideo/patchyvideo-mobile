<!--    vue页面：list_mobile.vue     -->
<!--
    页面：paychyvideo-mobile的主页面
    功能：展示网站收录的所有视频/展示搜索结果
    包含组件：NavBar
    更新日志：
      2/14/2020：
        release
    ★待解决问题：
      暂无
-->
<template>
  <div class="home">
    <NavBar></NavBar>

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
      <ul class="videolist">
        <li
          class="list-item"
          v-for="item in videolist"
          :key="item._id.$oid"
          @click="gotoList({ path: '/mobile/listdetail', query: { id: item._id.$oid } })"
        >
          <div class="video-thumbnail">
            <img :src="'/images/covers/'+item.cover" width="120px" height="75px" />
          </div>
          <div class="video-detail">
            <p class="video-detail-title">
              <a>{{ item.title.english }}</a>
            </p>
            <div class="video-detail-desc">
              <p>共{{ item.videos }}个视频</p>
            </div>
          </div>
        </li>
      </ul>

      <!-- 分页器 -->
      <el-pagination
        :hide-on-single-page="true"
        :page-size="20"
        :pager-count="5"
        layout="prev, pager, next"
        :total="count"
        :current-page="this.page"
        @current-change="handleCurrentChange"
      ></el-pagination>

      <!-- 回到顶部 -->
      <el-backtop :right="20"></el-backtop>
    </div>
  </div>
</template>

<script>
import NavBar from "../components/NavBar_list_mobile";
export default {
  data() {
    return {
      // 请求到的视频列表
      videolist: [],
      // 搜索的关键字
      keyword: "",
      // 一共请求到的页数
      page: 1,
      // 每一页的视频数
      page_size: 20,
      // 视频总数
      count: 0,
      // 视频列表的排序规则
      options: [
        { value: "latest", label: "时间正序" },
        { value: "oldest", label: "时间倒序" },
        { value: "last_modified", label: "最新修改" }
      ],
      // 当前视频列表的排列顺序
      couponSelected: "latest",
      // 视频列表是否属于加载状态的判断
      loading: false
    };
  },
  computed: {
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
    this.$store.commit("changeBgc", "list");
    // 修改网站标题
    document.title = "播放列表 - Patchyvideo";
    // 获取视频列表
    this.searchList();
  },
  mounted() {},
  methods: {
    // 当前播放列表的页面切换的时候调用
    handleCurrentChange(val) {
      this.page = val;
      this.searchList();
    },
    // 跳转到列表详情
    gotoList(url) {
      var sp = document.getElementsByClassName("openOriginalSite");
      if (sp) {
        if (event.target == sp[0] || event.target == sp[1]) return false;
      }
      this.$router.push(url);
    },
    // 搜索列表
    searchList() {
      // 先使页面出于加载状态
      this.loading = true;

      // 请求数据
      this.axios({
        method: "post",
        url: "be/lists/search.do",
        data: {
          page: this.page,
          page_size: this.page_size,
          order: this.couponSelected,
          query: this.keyword
        }
      }).then(result => {
        this.count = result.data.data.count;
        this.videolist = result.data.data.playlists;

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
  watch: {
    couponSelected() {
      this.handleCurrentChange(1);
    },
    $route(newV, oldV) {
      this.page = 1;
      //监听路由query的值
      if (JSON.stringify(this.$route.query) == "{}") {
        this.keyword = "";
        // 修改网站标题
        document.title = "播放列表 - Patchyvideo";
        this.searchList();
        return;
      }
      //监听路由query的值，当用户连续输入的搜索值不一样时，更新搜索关键词，调用 this.getSearchData获取搜索数据并渲染。
      if (newV.query.keyword != oldV.query.keyword) {
        this.keyword = newV.query.keyword;
        // 修改网站标题
        document.title = " 搜索结果- " + newV.query.keyword;
        this.searchList();
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
  padding-top: 64px;
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
.list-item:active {
  transform: translate(3px, 3px);
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
