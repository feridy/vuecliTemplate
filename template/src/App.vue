<template>
  <div id="app">
    <keep-alive>
      <router-view v-wechat-title="title" v-if="$route.meta.keepAlive"></router-view>
    </keep-alive>
    <router-view v-wechat-title="title" v-if="!$route.meta.keepAlive"></router-view>
  </div>
</template>

<script>
export default {
  name: 'app',
  data() {
    return {
      title: process.env.VUE_APP_TITLE,
    };
  },
  created() {},
  methods: {
    checkTitle() {
      if (this.$route.meta.detail) {
        const title = window.localStorage.getItem('title');
        return title;
      }
      return this.$route.meta.title;
    },
    // 改变标题
    changeTitle(title) {
      this.title = title;
    },
  },
  // 注入,为了所有的子代使用调用父级的方法
  provide() {
    return {
      changeTitle: this.changeTitle,
    };
  },
};
</script>

<style lang="less">
/** @format */

#app {
  font-family: sans-serif, 'PingFang-SC-Medium', 'Avenir', Helvetica, Arial;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  font-size: 0.32rem;
  line-height: 1.5;
  text-align: center;
}
</style>
