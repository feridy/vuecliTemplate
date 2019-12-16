<template>
  <div class="login">
    <h1>登陆中....</h1>
  </div>
</template>
<script>
import { login } from 'api';
import { Cookie } from '../util/cache';

export default {
  // 这个页面要完成微信公众号的授权
  created() {
    const { origin } = window.location;

    const { redirect } = this.$route.query;

    const toUrl = `${origin}/#${redirect}`;

    const ua = window.navigator.userAgent.toLowerCase();

    this.toUrl = toUrl;

    this.redirect = redirect;

    const coToken = Cookie.get(process.env.VUE_APP_COOKIE);

    const wToken = window.localStorage.getItem('token');

    if (ua.match(/MicroMessenger/i)) {
      if (coToken) {
        // 如果两个值相等，就进行跳转
        if (wToken) {
          if (wToken === coToken) {
            this.$router.replace(redirect);
            return;
          }
          // 不相等就重新获取token, 先删除token为了获取cookie赋值用
          window.localStorage.removeItem('token');
          // 无痕跳转
          window.location.replace(
            `http://hdwx.museum-edu.cn/wx_oauth?pid=22&vue_url=${redirect}`
          );
        } else {
          // 如果不存在token就进行赋值，现在所有的凭证全部来自window.loclStorage.token
          window.localStorage.setItem('token', coToken);
          this.$router.replace(redirect);
        }
        return;
      }
      // 没有cookie的也进行获取cookie
      const nowUrl = this.$route.fullPath;
      console.log(nowUrl);
      window.location.replace(
        `http://hdwx.museum-edu.cn/wx_oauth?pid=22&vue_url=${redirect}`
      );
      const token = Cookie.get(process.env.VUE_APP_COOKIE);
      console.log(token);
    } else {
      this.userInfo = {
        openid: 'OpenId',
        nickname: `nickname${Date.now()}`,
        sex: '1',
        province: 'Tian Jin',
        city: 'Tian Jin',
        country: 'chain',
        headimgurl:
          'http://thirdwx.qlogo.cn/mmopen/g3MonUZtNHkdmzicIlibx6iaFqAc56vxLSUfpb6n5WKSYVY0ChQKkiaJSgQ1dZuTOgvLLrhJbERQQ4eMsv84eavHiaiceqxibJxCfHe/46',
        unionid: 'o6_bmasdasdsad6_2sgVt7hMZOPfL',
      };
      console.log(this.userInfo);
    }
  },
  data() {
    return {
      wxConfig: {},
      toUrl: '',
      accessToken: {},
      userInfo: {},
      loginSuccess: {},
      redirect: '',
    };
  },
  watch: {
    userInfo: {
      handler(newValue) {
        if (newValue) {
          login({
            openid: newValue.openid,
            b_nickname: newValue.nickname,
            b_avatar: newValue.headimgurl,
            unionid: newValue.unionid,
            p: 't',
            b_from: 'wx',
          }).then(res => {
            this.loginSuccess = res.data;
            window.localStorage.setItem('token', res.data.api_token);
            this.$router.replace(this.redirect);
          });
        }
      },
      deep: true,
    },
  },
  methods: {},
};
</script>
