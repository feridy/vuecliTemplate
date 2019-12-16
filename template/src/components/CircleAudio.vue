<template>
  <div class="circle-container" v-on:click="playAudio">
    <progress-bar
      class="circle-progress"
      :trail-width="trailWidth"
      :trail-color="trailColor"
      :stroke-color="strokeColor"
      :progress="progress"
      :fill-color="fillColor"
    >
      <div style="position: relative;">
        <span class="play-icon iconfont icon-play" v-show="!audioLoading&&!audioPlaying"></span>
        <PlayingIcon v-show="!audioLoading&&audioPlaying"></PlayingIcon>
      </div>
      <div class="audio-loadding" v-show="audioLoading">
        <!-- <div class="audio-loading_icon"></div> -->
        <hollow-dots-spinner
          :animation-duration="1000"
          :dot-size="15"
          :dots-num="1"
          color="#ff1d5e"
        />
      </div>
    </progress-bar>
    <div class="circle-mark" v-show="audioPlaying"></div>
  </div>
</template>
<script>
import { ProgressBar } from 'vue-ydui/dist/lib.rem/progressbar';
import { HollowDotsSpinner } from 'epic-spinners';
import PlayingIcon from './PlayingIcon.vue';

export default {
  name: 'circle-audio',
  props: {
    trailWidth: {
      type: Number,
      default: 4,
    },
    trailColor: {
      type: String,
      default: '#009240',
    },
    // strokeColor: {
    //   type: String,
    //   default: '#009240',
    // },
    audioSource: {
      type: String,
      default: ' ',
    },
  },
  components: {
    ProgressBar,
    HollowDotsSpinner,
    PlayingIcon,
  },
  created() {
    console.log(this.$route);
    this.progress = 0;
  },
  watch: {
    // 解决切换页面，音频还播放的问题
    $route: {
      handler(value) {
        const audio = this.$root.$el.querySelector('#circle-audio-id');
        if (audio) {
          audio.pause();
          audio.currentTime = 0;
        }
        // console.log(audio);
        return value;
      },
      deep: true,
    },
    audioPlaying: {
      handler(value) {
        if (value) {
          this.fillColor = '#fff';
          this.strokeColor = '#E0E0E0';
        } else {
          this.fillColor = '#009240';
          this.strokeColor = '#009240';
        }
      },
    },
  },
  data() {
    return {
      progress: 0,
      // eslint-disable-next-line no-underscore-dangle
      flag: this._uid, // 来控制是否为同一个组件
      audioLoading: false,
      audioPlaying: false,
      fillColor: '#009240',
      strokeColor: '#009240',
    };
  },
  methods: {
    playAudio() {
      if (!this.audioSource.trim()) {
        this.$dialog.toast({
          mes: 'Not Audio Src',
          icon: 'error',
          timeout: 2000,
        });
        return;
      }
      const vm = this;
      // eslint-disable-next-line no-underscore-dangle
      const rootElement = this.$root.$el;
      const currentAudio = document.getElementById('circle-audio-id');
      // eslint-disable-next-line no-underscore-dangle
      const otherAudio = document.querySelector('audio[data-index]');
      if (!currentAudio) {
        this.audioLoading = true;
        const audio = document.createElement('audio');
        audio.id = 'circle-audio-id';
        audio.src = this.audioSource;
        // eslint-disable-next-line no-underscore-dangle
        audio.setAttribute('data-index', this._uid);
        // audio.setAttribute('src', this.audioSource);
        rootElement.appendChild(audio);

        audio.play();
        audio.addEventListener('canplay', () => {});
        audio.addEventListener('canplaythrough', () => {
          this.audioLoading = false;
        });
        audio.addEventListener('load', () => {
          vm.progress = 0;
        });
        audio.addEventListener('play', () => {
          // this.audioLoading = false;
          this.audioPlaying = true;
        });
        audio.addEventListener('timeupdate', function() {
          vm.progress = this.currentTime / this.duration;
        });
        audio.addEventListener('ended', () => {
          this.audioPlaying = false;
          this.audioLoading = false;
        });
        audio.addEventListener('pause', () => {
          this.audioPlaying = false;
          this.audioLoading = false;
        });
        return;
      }
      if (rootElement.contains(currentAudio)) {
        // 不是点击同一个播放按钮
        if (this.flag !== Number(otherAudio.getAttribute('data-index'))) {
          // currentAudio.load();
          // 为了清除已经播放的进度条
          this.audioLoading = true;

          currentAudio.currentTime = 0;
          // console.log(currentAudio.currentTime);
          rootElement.removeChild(currentAudio);
          const audioOther = document.createElement('audio');
          audioOther.id = 'circle-audio-id';
          audioOther.src = this.audioSource;
          // eslint-disable-next-line no-underscore-dangle
          audioOther.setAttribute('data-index', this._uid);
          // audio.setAttribute('src', this.audioSource);
          rootElement.appendChild(audioOther);

          audioOther.play();
          audioOther.addEventListener('canplay', () => {
            // console.log('audio can play');
            // console.log(audioOther.duration);
          });
          audioOther.addEventListener('play', () => {
            this.audioPlaying = true;
          });
          audioOther.addEventListener('canplaythrough', () => {
            this.audioLoading = false;
          });
          audioOther.addEventListener('load', () => {
            vm.progress = 0;
          });
          audioOther.addEventListener('timeupdate', function() {
            // console.log(this.currentTime);
            vm.progress = this.currentTime / this.duration;
          });
          audioOther.addEventListener('ended', () => {
            this.audioPlaying = false;
            this.audioLoading = false;
          });
          audioOther.addEventListener('pause', () => {
            this.audioPlaying = false;
            this.audioLoading = false;
            // console.log('audio paused');
            // console.log(this);
          });
          return;
        }
        if (currentAudio.paused) {
          currentAudio.play();
          // this.audioPlaying = true;
        } else if (!this.audioLoading) {
          currentAudio.pause();
          // this.audioPlaying = false;
        }
      }

      // 给audio添加相关事件
      // console.log(currentAudio);
    },
  },
  destroyed() {
    // console.log('destroyed');
  },
  beforeDestroy() {
    // console.log('destroyed');
    const currentAudio = document.getElementById('circle-audio-id');
    if (currentAudio) {
      const rootElement = this.$root.$el;
      rootElement.removeChild(currentAudio);
    }
  },
};
</script>
<style lang="less" scoped>
/** @format */

@import '../css/veriable.less';
.circle-container {
  position: relative;
  width: 100%;
  height: 100%;
  // background-color: @themeColor;
  .circle-mark {
    position: absolute;
    top: 0;
    right: 0;
    z-index: -1;
    width: 100% - 30px;
    height: 60px;
    background-color: @themeColor;
    opacity: 0.2;
  }
  .circle-progress {
    width: 60px;
    height: 60px;
    max-width: 0.72rem;
    max-height: 0.72rem;
    border-radius: 50%;
    overflow: hidden;
    .play-icon {
      // display: none;
      font-size: 0.3rem;
      color: #fff;
    }
    .playing {
      display: none;
    }
    .audio-loadding {
      .audio-loading_icon {
        width: 40px;
        height: 40px;
        border: 2px solid #ccc;
        border-left: none;
        border-radius: 50%;
      }
    }
  }
  // background-color: #000;
}
</style>
