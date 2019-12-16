<template>
  <div class="playing-container">
    <div class="first-circle"></div>
    <div class="second-circle"></div>
    <div class="third-circle"></div>
  </div>
</template>
<script>
export default {};
</script>

<style lang="less" scoped>
@import "../css/veriable.less";
.playing-container {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 50px;
  height: 50px;
  overflow: hidden;
  transform: translate(0, -50%) rotate(45deg);
  .first-circle {
    position: absolute;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    border: 2px solid darken(@themeColor, 10%);
    transform: translate(-80%, 80%);
  }
  .second-circle {
    position: absolute;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    border: 2px solid darken(@themeColor, 10%);
    transform: translate(-70%, 70%);
    animation: fadeInOut 1s infinite 0.2s;
  }
  .third-circle {
    position: absolute;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    border: 2px solid darken(@themeColor, 10%);
    transform: translate(-60%, 60%);
    animation: fadeInOut 1s infinite 0.4s;
  }
  @keyframes fadeInOut {
    0% {
      opacity: 0;
    }

    100% {
      opacity: 1;
    }
  }
}
</style>
