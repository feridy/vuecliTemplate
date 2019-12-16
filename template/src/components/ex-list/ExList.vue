<template>
  <div class="exlist">
    <div class="exlist-img" @click="setTitle($attrs.id, $attrs.title)">
      <img :src="$attrs.imageSrc" :alt="$attrs.title" />
    </div>

    <div class="exlist-content" @click="setTitle($attrs.id, $attrs.title)">
      <h2 class="exlist-title" v-text="$attrs.title"></h2>
      <p class="exlist-text" v-text="$attrs.text"></p>
    </div>

    <div class="exlist-audio">
      <div class="exlist-audio-obj">
        <circle-audio :audioSource="$attrs.audioSrc" trailColor="#317030"></circle-audio>
      </div>
      <div class="exlist-audio-time">
        <span>{{audioDuration}}</span>
      </div>
    </div>
  </div>
</template>

<script>
import CircleAudio from '../CircleAudio.vue';

export default {
  inheritAttrs: false,
  data() {
    return {
      audioSrc: '',
      // attr: this.$attrs,
    };
  },
  created() {
    this.audioSrc = `${
      process.env.VUE_APP_BASE_URL
    }/uploadfiles/exhibt/20190314/201903141600046215.mp3`;
  },
  computed: {
    audioDuration() {
      let munites = '00';
      let seconds = '00';
      if (this.$attrs.duration) {
        const { duration } = this.$attrs;
        munites = Math.floor(duration / 60)
          .toString()
          .padStart(2, '0');
        seconds = (duration % 60).toString().padStart(2, '0');
      }
      return `${munites}:${seconds}`;
    },
  },
  components: {
    CircleAudio,
  },
  methods: {
    // 设置title
    setTitle(id, title) {
      window.localStorage.setItem('title', title);
      this.$router.push(`/exhibit/detail/${id}`);
    },
  },
};
</script>

<style lang="less" scoped>
/** @format */

@prefix: exlist;
@import '../../css/veriable.less';
@import '../../css/mixins.less';
.@{prefix} {
  width: 100%;
  height: 200px;
  padding: 30px 0;
  display: flex;
  /* prettier-ignore */
  border: 1PX solid rgba(224, 224, 224, 1);
  box-shadow: 0px 10px 11px 0px rgba(0, 0, 0, 0.05);
  border-radius: 10px;
  &-img {
    padding: 0 30px;
    flex: 1;
    > img {
      width: 140px;
      height: 140px;
      background: rgba(160, 160, 160, 1);
      border-radius: 8px;
    }
  }
  &-content {
    // margin-top: -3px;
    // margin-bottom: -8px;
    display: flex;
    flex-flow: column nowrap;
    justify-content: space-between;
    flex: 3;
    width: 350px;
    text-align: justify;
    .@{prefix}-title {
      width: 350px;
      font-size: 30px;
      font-weight: bold;
      .line-clamp(2, 1.3);
    }
    .@{prefix}-text {
      width: 350px;
      // margin-top: 10px;
      font-size: 24px;
      color: #666666;
      .line-clamp(2, 31px);
    }
  }
  &-audio {
    flex: 1;
    height: 100%;
    // padding-top: 20px;
    display: flex;
    flex-flow: column nowrap;
    justify-content: space-around;
    padding-left: 50px;
    &-obj {
      width: 100%;
      height: 60px;
    }
    &-time {
      width: 60px;
      text-align: center;
      font-size: 20px;
      color: #a9a9a9;
    }
  }
}
</style>
