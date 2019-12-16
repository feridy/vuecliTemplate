<template>
  <div class="audio-container">
    <div class="audio-control" v-on:click="playAudio()">
      <span v-show="!audioLoading" ref="playIcon" class="audio-control_icon iconfont icon-bofang1"></span>
      <div class="audio-loadding" v-show="audioLoading">
        <!-- <div class="audio-loading_icon"></div> -->
        <hollow-dots-spinner
          class="audio-loading_icon"
          :animation-duration="1000"
          :dot-size="15"
          :dots-num="1"
          color="#ff1d5e"
        />
      </div>
    </div>
    <div class="audio-curtime">{{ audioCurrentTime }}</div>
    <div class="audio-progress" ref="audioProgressControl">
      <div class="audio-progress_btn" ref="audioProgressBtn"></div>
      <div class="audio-progress_cur" ref="audioProgressCur"></div>
    </div>
    <div class="audio-duration">{{audioDuration}}</div>
    <audio ref="audioElement" :src="audioSrc"></audio>
  </div>
</template>
<script>
import { HollowDotsSpinner } from 'epic-spinners';

export default {
  name: 'normal-audio',
  data() {
    return {
      // audioDuration: this.formatTime(this.duration),
      audioCurrentTime: '00:00',
      audioLoading: false,
    };
  },
  props: {
    duration: {
      type: Number,
      // default: 0,
    },
    audioSrc: {
      type: String,
    },
  },
  components: {
    HollowDotsSpinner,
  },
  computed: {
    audioDuration() {
      return this.formatTime(this.duration);
    },
  },
  mounted() {
    const {
      audioElement,
      audioProgressBtn,
      audioProgressCur,
      audioProgressControl,
      playIcon,
    } = this.$refs;
    let currentX = 0;
    let moveX = 0;
    let btnLeft = 0;
    let progressWidth = 0;
    let durationTime = 0;
    audioElement.addEventListener('canplay', () => {
      console.log('audio can play');
      console.dir(audioElement);
      this.audioLoading = false;
      if (!this.duration) {
        // this.audioDuration = this.formatTime(audioElement.duration);
      }
      durationTime = audioElement.duration;
    });
    audioElement.addEventListener('timeupdate', () => {
      this.audioLoading = false;
      this.audioCurrentTime = this.formatTime(audioElement.currentTime);
      const audioProgress =
        (audioElement.currentTime / audioElement.duration) * 100;
      audioProgressBtn.style.left = `${audioProgress}%`;
      audioProgressCur.style.width = `${audioProgress}%`;
    });
    audioElement.addEventListener('ended', () => {
      console.log('aduio has end');
      audioProgressBtn.style.left = '100%';
      audioProgressCur.style.width = '100%';
    });
    audioProgressBtn.addEventListener('touchstart', e => {
      currentX = e.touches[0].clientX;
      btnLeft = audioProgressBtn.offsetLeft;
      progressWidth = audioProgressControl.offsetWidth;
      if (!audioElement.paused) {
        audioElement.pause();
        playIcon.classList.remove('icon-zanting1');
        playIcon.classList.add('icon-bofang1');
      }
    });
    audioProgressBtn.addEventListener('touchmove', e => {
      moveX = e.touches[0].clientX - currentX;
      if (moveX + btnLeft >= progressWidth) {
        moveX = progressWidth;
      } else if (moveX + btnLeft <= 0) {
        moveX = 0;
      } else {
        moveX += btnLeft;
      }
      // audioProgressBtn.style.left = `${moveX / progressWidth * 100}%`;
      // audioProgressCur.style.width = `${moveX / progressWidth * 100}%`;
      audioElement.currentTime = (moveX / progressWidth) * durationTime;
    });
    audioProgressBtn.addEventListener('touchend', e => {
      if (audioElement.paused) {
        audioElement.play();
        playIcon.classList.remove('icon-bofang1');
        playIcon.classList.add('icon-zanting1');
      }
    });
  },
  methods: {
    playAudio() {
      const { audioElement, playIcon } = this.$refs;
      if (!this.audioSrc.trim().length) {
        this.$dialog.toast({
          mes: 'Not Audio Src',
          icon: 'error',
          timeout: 2000,
        });
        return;
      }
      if (audioElement.paused) {
        audioElement.play();
        if (this.audioCurrentTime === '00:00') {
          this.audioLoading = true;
        }
        playIcon.classList.remove('icon-bofang1');
        playIcon.classList.add('icon-zanting1');
      } else {
        audioElement.pause();
        playIcon.classList.remove('icon-zanting1');
        playIcon.classList.add('icon-bofang1');
      }
    },
    formatTime(number) {
      if (!number) {
        return '00:00';
      }
      const time = Math.ceil(number);
      const minutes = Math.floor(time / 60)
        .toString()
        .padStart(2, '0');
      const seconds = Math.ceil(time % 60)
        .toString()
        .padStart(2, '0');
      const strFormat = `${minutes}:${seconds}`;
      return strFormat;
    },
  },
};
</script>
<style lang="less" scoped>
/** @format */

.audio-container {
  display: flex;
  align-items: center;
  .audio-control {
    &_icon {
      font-size: 0.72rem;
      color: #fff;
    }
  }
  .audio-curtime {
    padding: 0 0.3rem;
  }
  .audio-progress {
    position: relative;
    width: 100%;
    height: 4px;
    border-radius: 2px;
    background-color: rgba(210, 210, 210, 0.5);
    // opacity: 0.5;
    &_btn {
      position: absolute;
      top: 50%;
      left: 0%;
      transform: translate(-50%, -50%);
      width: 0.2rem;
      height: 0.2rem;
      background-color: #fff;
      background-clip: content-box;
      border-radius: 0.2rem;
      // border: 0.06rem solid rgba(255, 255, 255, 1);
      // opacity: 0.5;
      z-index: 100;
    }
    &_cur {
      position: absolute;
      top: 50%;
      left: 0%;
      transform: translate(0, -50%);
      width: 0%;
      height: 0.04rem;
      border-radius: 2px;
      background-color: #fff;
    }
  }
  .audio-duration {
    padding-left: 0.3rem;
  }
  .audio-loadding {
    position: relative;
    width: 72px;
    height: 72px;
    border-radius: 50%;
    border: 4px solid #fff;
    .audio-loading_icon {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 40px;
      height: 40px;
    }
  }
}
</style>
