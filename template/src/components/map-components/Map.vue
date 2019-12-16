/* eslint-disable max-len */
/* eslint-disable import/no-dynamic-require */
/* eslint-disable global-require */
/* eslint-disable no-underscore-dangle */
<template>
  <div class="main-container">
    <div ref="map" class="map-container"></div>
    <!-- 一对多的弹窗效果 -->
    <div class="top-show" v-if="showList">
      <div class="ex-list">
        <div
          class="ex-item"
          v-for="(item, index) in showContent"
          :key="index"
          @click="goExDetail(item.exhibit_id, item.exhibit_name)"
        >
          <img :src="item.exhibit_list" alt />
          <div class="context">
            <h2>{{item.exhibit_name}}</h2>
            <div class="detail" v-html="item.content">{{item.content}}</div>
          </div>
          <div class="right-icon">
            <span></span>
          </div>
        </div>
      </div>
      <div class="top-close">
        <span></span>
        <span class="iconfont icon-close-circle" @click="closePopup"></span>
      </div>
    </div>
    <audio src ref="audio"></audio>
  </div>
</template>

<script>
import L from 'leaflet';
import wx from 'weixin-js-sdk';
import { getWXConfig } from 'api';

export default {
  props: {
    toggleRouteMapFag: {
      type: Boolean,
      default: false,
    },
    toggleServicMapFag: {
      type: Boolean,
      default: false,
    },
    mapObj: {
      type: Object,
    },
    mapExs: {
      type: Array,
    },
    mapServices: {
      type: Array,
    },
  },
  components: {
    // myIcon: Icons,
  },
  data() {
    return {
      Lmap: null, // 地图的对象-L.map 父级对象
      cuerrMap: null,
      baseMap: null, // 底层地图
      baseURL: process.env.VUE_APP_BASE_URL,
      openPopup: null,
      showList: false,
      showContent: [],
      // 渲染展品点位的列表
      autoList: {
        itemList: [],
      },
      // 微信配置
      wxConfig: {},
      isBtooth: false,
      // 蓝牙错误信息
      beaconmsg: {
        errMsg: [
          'startSearchBeacons:ok',
          'startSearchBeacons:already started',
          'startSearchBeacons:bluetooth power off',
          'startSearchBeacons:location service disable',
          'startSearchBeacons:system unsupported',
        ],
        note: [
          '打开成功',
          '打开后未stop再次打开',
          '请打开蓝牙和定位并刷新页面',
          '请打开蓝牙和定位并刷新页面',
          '系统不支持',
        ],
      },
      blueHandlefun: null,
      handleInterval: 0,
      timeBluefun: null,
      current_minor: null,
      markerList: [],
      // 被点击的marker
      clickMarker: null,
      test: [],
      searchTimeout: 0,
      searchHandleTimeId: null,
    };
  },
  computed: {
    // marker的图片类,基本的保持一致的图标类
  },
  created() {
    console.log(L);
    console.log(this.$attrs);
    // 自定义的图标类，继承自L.Icon
    // 获取微信配置
    const ua = window.navigator.userAgent.toLowerCase();
    const url = window.location.href.split('#')[0];
    console.log(window.location.href);
    if (ua.match(/MicroMessenger/i)) {
      getWXConfig({ url }).then(res => {
        console.log(res);
        this.wxConfig = res.data;
        wx.config({
          debug: false,
          appId: res.data.appId,
          timestamp: res.data.timestamp,
          nonceStr: res.data.nonceStr,
          signature: res.data.signature,
          jsApiList: [
            'startSearchBeacons',
            'stopSearchBeacons',
            'onSearchBeacons',
            'closeWindow',
          ],
        });
        this.startBlue();
      });
    }
  },
  watch: {
    mapObj: {
      handler(newValue) {
        if (newValue) {
          this.Lmap = this.mapInit(this.$refs.map, {
            maxBounds: [[0, 0], this.mapObj.mapSize],
            maxZoom: 1,
            minZoom: -2,
            zoom: -0.5,
            center: [0, 0],
          });
          this.baseMap = this.renderImageOverlay(
            this.mapObj.guideMap,
            this.mapObj.mapSize
          );
          this.baseMap.addTo(this.Lmap);
        }
      },
      deep: true,
    },
    toggleRouteMapFag: {
      handler(value) {
        if (!this.mapObj) {
          return;
        }
        console.log(`toggleRouteMapFag:${value}`);
        if (value) {
          this.changeMap(this.mapObj.routeMap);
        } else if (!this.toggleServicMapFag) {
          this.changeMap(this.mapObj.guideMap);
          this.showMapEx(this.mapExs);
        }
      },
      deep: true,
    },
    toggleServicMapFag: {
      handler(value) {
        if (!this.mapObj) {
          return;
        }
        console.log(`toggleServicMapFag:${value}`);
        if (value) {
          this.myRemoveLayer(false);
          this.changeMap(this.mapObj.guideMap);
          if (this.mapServices) {
            this.showService(this.mapServices);
          }
        } else if (!this.toggleRouteMapFag) {
          this.myRemoveLayer(false);
          this.showMapEx(this.mapExs);
        }
      },
      deep: true,
    },
    mapExs: {
      handler(newValue) {
        this.showMapEx(newValue);
      },
      deep: true,
    },
    // searchTimeout: {
    //   handler(value) {
    //     if (value >= 10) {
    //       clearInterval(this.searchHandleTimeId);
    //       this.removeTrans();
    //     }
    //   },
    // },
  },
  mounted() {
    const { audio } = this.$refs;
    audio.addEventListener('timeupdate', () => {
      console.log(audio.currentTime);
    });
    window.testBlue = [
      {
        minor: 7124,
        accuracy: 2,
      },
    ];
    this.test = window.testBlue;
    // setTimeout(() => {
    //   this.handleBlue(this.test);
    // }, 4000);
    // this.handleBlue(this.test);
    // window.timeId = window.setInterval(() => {
    //   this.handleBlue(this.test);
    // }, 2000);
    // window.testBlue = this.test;
  },
  methods: {
    // 渲染展品点位
    showMapEx(mapExs) {
      if (mapExs && this.Lmap) {
        this.markerList = [];
        this.autoList = {};
        this.autoList.itemList = [];
        console.log(mapExs);
        mapExs.forEach(item => {
          // 处理一下数据
          if (item.oneautonum === 0 && item.auto_string) {
            if (Object.keys(this.autoList).includes(item.auto_string)) {
              this.autoList[item.auto_string].list.push(item);
            } else {
              this.autoList[item.auto_string] = {
                point: [item.x, item.y],
                list: [item],
              };
            }
          } else {
            // this.autoList.itemList = [];
            this.autoList.itemList.push(item);
          }
        });
        // 一对多点位渲染
        Object.entries(this.autoList).forEach(item => {
          console.log(item);
          // 一对一的点位渲染
          if (item[0] === 'itemList') {
            item[1].forEach(obj => {
              const marker = this.myMarker(
                [obj.x, obj.y],
                obj.exhibit_list,
                obj.exhibit_name,
                {},
                obj.auto_string,
                [obj.y, obj.x]
              ).addTo(this.Lmap);
              this.markerList.push(marker);
              marker.addEventListener('click', e => {
                console.log(e);
                // window.localStorage.removeItem('title')
                window.localStorage.setItem('title', obj.exhibit_name);
                this.$router.push({
                  path: `/exhibit/detail/${obj.exhibit_id}`,
                });
              });
            });
          } else {
            const option = {
              html: `<div class="my-div-icon-marker" data-minor="${
                item[0]
              }" data-x="${item[1].point[1]}", data-y="${item[1].point[0]}">
                      <div>
                        <span></span>
                        <span>${item[1].list.length}</span>
                      </div>  
                  </div>`,
            };
            const marker = this.myMarker(item[1].point, true, '', option).addTo(
              this.Lmap
            );
            this.markerList.push(marker);
            marker.addEventListener('click', e => {
              console.log(e);
              this.showList = true;
              this.showContent = item[1].list;
              const markerElement = marker.getElement().children[0];
              markerElement.classList.add('scale');
              this.clickMarker = markerElement;
            });
          }
        });
        // eslint-disable-next-line no-underscore-dangle
        // this.Lmap.flyTo([246, 1919]);
      }
    },
    // 渲染服务点位
    showService(service) {
      console.log(service);
      service.forEach(item => {
        const option = `<div class="service-mark">
                            <img src="${item.img}">
                        </div>`;
        this.myMarker(
          [item.x, item.y],
          item.img,
          '',
          { html: option },
          ''
        ).addTo(this.Lmap);
      });
    },
    // 点击一对多列表跳转
    goExDetail(id, name) {
      console.log(name);
      window.localStorage.setItem('title', name);
      this.$router.push({ path: `/exhibit/detail/${id}` });
    },
    // 关闭列表时清除放大类
    closePopup() {
      this.showList = !this.showList;
      this.clickMarker.classList.remove('scale');
    },
    // 转化地图的点位(x,y) => (y,x)
    transformxyToyx(x, y) {
      if (L.Util.isArray(x)) {
        return L.latLng(x[1], x[0]);
      }
      return L.latLng(y, x);
    },
    // 地图初始化方法，来初始化地图对象
    // 主要是传入一个对象包含maxBounds:[]最大边界的数组
    mapInit(mapContainer, option = {}) {
      if (option.maxBounds) {
        option.maxBounds = [
          this.transformxyToyx(option.maxBounds[0]),
          this.transformxyToyx(option.maxBounds[1]),
        ];
      }
      const initOption = {
        crs: L.CRS.Simple,
        zoomControl: false,
        attributionControl: false,
        minZoom: 0,
        maxZoom: 0,
        zoom: 0,
        // zoomSnap: 0.5,
        // zoomDelta: 0.5,
        center: [0, 0],
      };
      Object.assign(initOption, option);
      const Lmap = L.map(mapContainer, initOption);
      Lmap.fitBounds(option.maxBounds || Lmap.getBounds());
      return Lmap;
    },
    // 渲染地图底图imageOverlay
    renderImageOverlay(imageSrc, size = [0, 0]) {
      const [cornerMin, cornerMax] = [[0, 0], this.transformxyToyx(size)];
      const bounds = L.latLngBounds(cornerMin, cornerMax);
      const baseMap = L.imageOverlay(imageSrc, bounds);
      return baseMap;
    },
    // 切换底层地图, 这改变的是底层图片，Lmap没有变化
    changeMap(url, callback) {
      const imageElement = this.baseMap.getElement();
      if (imageElement.src === url) {
        return;
      }
      this.myRemoveLayer(true);
      if (this.baseMap) {
        this.baseMap.setUrl(url);
        // 设置中心点的变化为了解决谷歌浏览切换地址，不切换地图的问题
        // const center = this.Lmap.getCenter();
        // const [X, Y] = [center.lat, center.lng];
        // console.log(center);
        // this.Lmap = this.Lmap.setView([X - 10, Y - 10]);
        console.log(this.Lmap.getBounds());
        console.log(this.Lmap.getCenter());
        this.Lmap = this.Lmap.setView(this.Lmap.getCenter());
        // this.Lmap.fitBounds(this.Lmap.getBounds());
      } else {
        this.baseMap = this.renderImageOverlay(url);
      }
      if (this.Lmap.hasLayer(this.baseMap)) {
        if (this.openPopup) {
          this.openPopup.closePopup();
        }
        this.Lmap.removeLayer(this.baseMap);
        this.autoList = {};
      }
      this.baseMap.addTo(this.Lmap);
      // 回调函数
      if (typeof callback === 'function') {
        callback();
      }

      console.log('changeMap');
    },
    // 清除所有的marker和puope
    /*
     * all： {true, false},
     * 用来判断是否保留底图
     */
    myRemoveLayer(all = true) {
      // 可以使用这个来清除所有的图层
      if (all) {
        this.Lmap.eachLayer(item => {
          this.Lmap.removeLayer(item);
        });
        return this.Lmap;
      }
      this.Lmap.eachLayer(item => {
        if (item !== this.baseMap) {
          this.Lmap.removeLayer(item);
        }
      });

      return this.Lmap;
    },
    // Marker图标的类
    myDefualtIcon(option = {}) {
      // 初始自带的一些选项
      // 因为在leafLet中全是px 所以要手动将rem => px
      const veiwSize = document.documentElement.offsetWidth;
      const designSize = 750;
      const baseFontSize = (veiwSize / designSize) * 100;
      const options = {
        // eslint-disable-next-line global-require
        iconUrl: require('assets/marker-icon-2x.png'),
        // eslint-disable-next-line global-require
        shadowUrl: require('assets/marker-shadow.png'),
        iconSize: [0.4 * baseFontSize, 0.6 * baseFontSize],
        shadowSize: [0.3 * baseFontSize, 0.4 * baseFontSize],
        iconAnchor: [0.2 * baseFontSize, 0.4 * baseFontSize],
        shadowAnchor: [0.11 * baseFontSize, 0.27 * baseFontSize],
        popupAnchor: [-3, -76],
      };
      Object.assign(options, option);
      return new L.Icon(options);
    },
    // Marker DivIcon
    myDivIcon(iconsrc = '', title = '', option = {}, minor, point) {
      const pointIn = point || [0, 0];
      const options = {
        html: `<div class="my-div-icon-marker" data-minor="${minor}" data-x="${
          pointIn[1]
        }" data-y="${pointIn[0]}">
                  <div>
                    <img src="${iconsrc}">
                  </div>  
                <div class="marker-title">${title}</div>
              </div>`,
        bgPos: [0, 0],
      };
      Object.assign(options, option);
      const divIcon = new L.DivIcon(options);
      return divIcon;
    },
    // 封装地图的marker方法
    /*
    * option: {
      divOption: {
        html: ""
      },
      defualtOption: {
        defualtIcon
      }
    }
    * point 为marker的点位为[x, y]的形式
    */
    myMarker(point, iconImage = '', title = '', option = {}, minor) {
      let icon = {};
      if (iconImage && !(iconImage instanceof Object)) {
        icon = this.myDivIcon(iconImage, title, option, minor, point);
      } else {
        icon = this.myDefualtIcon(iconImage || option);
      }
      const points = this.transformxyToyx(point);
      const marker = L.marker(points, { icon });
      return marker;
    },
    // popup 方法
    /*
     * exhibt = {
     *   name: '',
     *    image: '',
     *    content: '',
     *    id: 0,
     *    audio: '',
     *  }
     */
    mypopup(exhibt = {}, option = {}, callback) {
      const options = {
        offset: [0, -80],
        className: 'popup-wapper',
        // maxWidth: 1400,
      };
      Object.assign(options, option);
      const popup = L.popup(options);
      const initExhibt = {
        name: '',
        image: '',
        content: '',
        id: 0,
        audioSrc: '',
      };
      const obj = Object.assign(initExhibt, exhibt);
      const popupContent = `<div class='popup-container'>
                                  <h3 class='popup-title'>${obj.name}</h3>
                                  <div class='popup-content'>
                                    <img src='${obj.image}'>
                                    <div class='popup-right'>
                                      <p>${obj.content}</p>
                                      <div class='popup-btn'>
                                        <div class='audio-play'>
                                          <span class='iconfont icon-kefu'></span>
                                          <span class="tip-title">暂停</span>
                                        </div>
                                        <a href='#/ex_detail/${obj.id}?name=${
        obj.name
      }'>
                                          <span class='iconfont icon-tuwenxiangqing'></span>
                                          <span>详情</span>
                                        </a>
                                      </div>
                                    </div>
                                  </div>
                             </div>`;
      popup.setContent(popupContent);
      // 如果有回调函数，将回调函数绑定到添加到图层上时的事件
      if (typeof callback === 'function') {
        popup.addEventListener('add', callback);
        return popup;
      }
      // 如果没有回调函数，就根据默认的选项HTML，来完成最常见的播放音频事件
      popup.addEventListener('add', e => {
        // 获取到播放按钮
        console.log(e);
        console.log('aaaaa');
        // const popupElement = popup.getElement();
        // const audioPlayElement = popupElement.querySelector('.audio-play');
        // console.dir(audioPlayElement);
        const { audio } = this.$refs;
        audio.src = obj.audioSrc;
        console.log('111112233');
        console.log(audio);
        // audioPlayElement.addEventListener('click', () => {
        //   console.log('11111');
        //   if (audio.paused) {
        //     audio.play();
        //     const { classList } = audioPlayElement.querySelector('.iconfont');
        //     classList.remove('icon-kefu');
        //     classList.add('icon-ziyuanldpi');
        //   }
        // }, false);
        console.log('2000');
      });
      return popup;
    },
    // 蓝牙设备功能
    startBlue() {
      this.stopBlue();
      wx.ready(() => {
        wx.startSearchBeacons({
          ticket: '',
          complete: argv => {
            console.log(argv);
            const erri = this.beaconmsg.errMsg.indexOf(argv.errMsg);
            if (erri < 2 && erri >= 0) {
              this.isBtooth = true;
              this.$dialog.toast({
                mes: '已开启蓝牙匹配',
                timeout: 1500,
                icon: 'success',
              });
              // 设置定时3s处理一次返回信息
              // eslint-disable-next-line no-unused-expressions
              clearInterval(this.blueHandlefun);
              this.blueHandlefun = setInterval(() => {
                this.handleInterval += 1;
                this.handleInterval %= 3;
              }, 1000);

              this.searchBeacons();
            } else {
              this.isBtooth = false;
              this.$dialog.toast({
                mes: this.beaconmsg.note[erri],
                icon: 'error',
                timeout: 1500,
              });
            }
          },
        });
      });
    },
    // 关闭蓝牙
    stopBlue() {
      wx.ready(() => {
        wx.stopSearchBeacons({
          complete(res) {
            // 关闭查找完成后的回调函数
            this.isBtooth = false;
            console.log(res);
          },
        });
      });
    },
    // 监听周边ibeacon设备接口
    searchBeacons() {
      wx.onSearchBeacons({
        complete: argv => {
          console.log(argv);
          // this.$dialog.toast({
          //   mes: JSON.stringify(argv),
          //   timeout: 2000,
          // });
          // 回调函数，返回周边的相关设备列表
          if (argv.errMsg === 'onSearchBeacons:ok') {
            this.isBtooth = true;
            if (argv.beacons.length > 0) {
              if (this.handleInterval === 0) {
                this.handleBlue(argv.beacons);
              }
            } else {
              this.current_minor = null;
              this.removeTrans();
            }
          } else {
            this.isBtooth = false;
            this.current_minor = null;
            this.removeTrans();
          }
        },
      });
    },
    // 蓝牙匹配结果处理
    handleBlue(beacons) {
      console.log(this.searchTimeout);
      console.log(this.searchHandleTimeId);
      this.searchTimeout = 0;
      clearTimeout(this.searchHandleTimeId);
      this.searchHandleTimeId = window.setTimeout(() => {
        console.log('11111');
        this.searchTimeout = 4;
        console.log(this.searchTimeout);
        this.removeTrans();
      }, 4000);
      if (beacons.length === 0) return;
      const nesterBeacon = beacons.filter(
        item => item.accuracy > 0 && item.accuracy < 10
      );
      nesterBeacon.sort((a, b) => a.accuracy - b.accuracy);
      // eslint-disable-next-line no-unused-expressions
      this.timeBluefun && clearTimeout(this.timeBluefun);
      // if (nesterBeacon[0].minor === this.current_minor) {
      //   return;
      // }
      // this.removeTrans();
      if (nesterBeacon.length > 0) {
        this.addTrans(nesterBeacon[0].minor);
      } else {
        this.removeTrans();
      }
    },
    // 清除点位跳动效果
    removeTrans() {
      const transDom = document.querySelectorAll('.transImg');
      Array.from(transDom).forEach(item => {
        console.log(item);
        item.classList.remove('transImg', 'scale');
      });
    },
    // 添加跳动
    addTrans(minor) {
      if (!minor) {
        this.removeTrans();
        return;
      }
      if (minor === this.current_minor) {
        // this.removeTrans();
        const currenDom = document.querySelectorAll(
          `div[data-minor="${minor}"]`
        );
        Array.from(currenDom).forEach(item => {
          item.classList.add('transImg', 'scale');
        });
        return;
      }
      const matchDom = document.querySelectorAll(`div[data-minor="${minor}"]`);
      console.log(matchDom);
      this.removeTrans();
      if (matchDom.length > 0) {
        const point = [
          Number(matchDom[0].dataset.x),
          Number(matchDom[0].dataset.y),
        ];
        this.Lmap.flyTo(point);
        Array.from(matchDom).forEach(item => {
          item.classList.add('transImg', 'scale');
          // this.timeBluefun = setTimeout(() => {
          //   this.removeTrans();
          // }, 7000);
        });
        this.current_minor = minor;
      }
    },
  },
};
</script>

<style lang="less" scoped>
/** @format */

// @import "../../css/veriable.less";
// @import "../../css/mixins.less";
.main-container {
  position: relative;
  > h1 {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 80px;
    line-height: 80px;
    background-color: #fff;
    text-align: center;
    z-index: 1000;
  }
  > button {
    position: absolute;
    top: 20px;
    right: 30px;
    background: #ccc;
    border: 1px solid #333;
    // width: 40px;
    font-size: 24px;
    height: 40px;
    z-index: 1001;
  }
  .map-container {
    // height: 800px;
    height: 100vh;
    // background-color: aqua;
  }
  /deep/ .service-mark {
    position: absolute;
    // margin-left: -40px;
    // margin-top: -80px;
    width: 80px;
    height: 80px;
    // background-color: #333;
    img {
      width: 100%;
      height: 100%;
      // background-color: #333;
    }
  }
  /deep/ .my-div-icon-marker {
    position: absolute;
    margin-left: -48px;
    margin-top: -116px;
    transform: scale(1);
    width: 111px;
    height: 147px;
    background-image: url('../../assets/qipao_icon@2x.png');
    background-repeat: no-repeat;
    background-size: 100%;
    background-position: center;
    padding: 15px 15px 15px 20px;
    &.scale {
      transform: scale(186 / 111);
    }
    > div {
      width: 75px;
      height: 75px;
      border-radius: 50%;
      overflow: hidden;
      background-color: #fff;
      padding: 1px;
      span {
        color: @themeColor;
        line-height: 1;
        font-size: 38px;
        &:first-child {
          display: block;
          margin: 2px auto 0;
          width: 35px;
          height: 32px;
          background-image: url('../../assets/erji@2x .png');
          background-size: 100%;
          background-repeat: no-repeat;
          background-position: center;
        }
      }
      img {
        width: 100%;
        height: 100%;
        border-radius: 50%;
      }
    }
    .marker-title {
      display: none;
      position: absolute;
      bottom: 15px;
      left: 50%;
      transform: translate(-50%, 100%) scale(186 / 111 - 1);
      width: 282px;
      height: 43px;
      background: rgba(0, 0, 0, 0.7);
      border-radius: 22px;
      padding: 0;
      line-height: 47px;
      color: #a5d7b6;
      text-align: center;
      font-size: 20px;
    }
    /*预定义跳动样式*/
    &.transImg {
      animation: jumpdown 0.3s ease-in infinite alternate;
      .marker-title {
        display: block;
      }
    }
    @keyframes jumpdown {
      from {
        transform: translateY(-20px) scale(186 / 111);
      }
      to {
        transform: translateY(0px) scale(186 / 111);
      }
    }
  }
  /deep/ .leaflet-div-icon {
    background: transparent;
    border: none;
  }
  /deep/ .popup-wapper {
    width: 580px;
    height: 280px;
    .leaflet-popup-close-button {
      font: 30px/40px Tahoma, Verdana, sans-serif;
      width: 50px;
      height: 40px;
      right: 10px;
    }
    .popup-container {
      width: 550px;
      height: 280px;
      padding: 10px;
      .popup-title {
        width: 100%;
        font-weight: 500;
        font-size: 30px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        color: #301a0d;
      }
      .popup-content {
        margin-top: 20px;
        display: flex;
        flex-flow: row nowrap;
        img {
          width: 170px;
          height: 170px;
        }
        .popup-right {
          box-sizing: border-box;
          width: calc(100% - 130px);
          padding-left: 20px;
          font-size: 24px;
          display: flex;
          flex-flow: column nowrap;
          justify-content: space-between;
          p {
            padding: 0;
            margin: 0;
            line-height: 1.25;
          }
          .popup-btn {
            display: flex;
            justify-content: space-between;
            font-size: 24px;
            div,
            a {
              padding: 0 10px;
              width: 130px;
              height: 50px;
              border-radius: 30px;
              background-color: #d49630;
              display: flex;
              justify-content: space-around;
              span {
                color: #fff;
                line-height: 50px;
                &:first-child {
                  // padding-top: 2px;
                  font-size: 30px;
                }
              }
            }
          }
        }
      }
    }
  }
  .top-show {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    min-height: 100vh;
    background-color: rgba(0, 0, 0, 0.4);
    z-index: 710;
    .ex-list {
      width: 100%;
      padding: 20px;
      max-height: 7.8rem;
      background-color: #fff;
      overflow: auto;
      .ex-item {
        border: 1px solid rgba(224, 224, 224, 1);
        box-shadow: 0px 10px 11px 0px rgba(0, 0, 0, 0.05);
        border-radius: 10px;
        margin-bottom: 20px;
        padding: 30px;
        display: flex;
        text-align: left;
        > img {
          width: 170px;
          height: 170px;
          // flex: 1;
          border-radius: 8px;
          border: 1px solid #eee;
        }
        .context {
          flex: 3;
          margin-left: 35px;
          // min-width: 350px;
          display: flex;
          flex-flow: column nowrap;
          justify-content: space-between;
          > h2 {
            font-size: 30px;
            font-weight: bold;
            .line-clamp(2, 1.3);
          }
          .detail {
            font-size: 24px;
            color: #666666;
            .line-clamp(2, 1.5);
          }
        }
        .right-icon {
          flex: 1;
          display: flex;
          justify-content: center;
          align-items: center;
          > span {
            width: 32px;
            height: 56px;
            background-image: url('../../assets/right.png');
            background-repeat: no-repeat;
            background-position: center;
            background-size: 100%;
          }
        }
        &:last-child {
          margin-bottom: 0;
        }
      }
    }
    .top-close {
      display: flex;
      flex-flow: column;
      align-items: center;
      > span:first-child {
        width: 6px;
        height: 58px;
        background-color: #fff;
      }
      > span:last-child {
        color: #fff;
        line-height: 0.8;
        font-size: 68px;
      }
    }
  }
}
</style>
