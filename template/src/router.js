import Vue from 'vue';
import Router from 'vue-router';
import Home from './views/Home.vue';
import { Cookie } from './util/cache';

Vue.use(Router);
const router = new Router({
	routes: [
		{
			path: '/',
			name: 'home',
			component: Home,
			meta: {
				keepAlive: false,
				auth: false,
				title: 'Home',
			},
		},

		{
			path: '/login',
			name: 'login',
			component: () => import(/* webpackChunkName: "login" */ './views/Login.vue'),
			meta: {
				keepAlive: false,
				auth: false,
				title: '登陆',
			},
		},
	],
});
// 全局路由守卫
router.beforeEach((to, from, next) => {
	const ua = window.navigator.userAgent.toLowerCase();
	const { auth } = to.meta;
	const wToken = window.localStorage.getItem('token');
	const cToken = Cookie.get(process.env.VUE_APP_COOKIE);
	let isNext = false;
	// 要进行平台判断
	if (ua.match(/MicroMessenger/i)) {
		if (cToken) {
			if (wToken === '0') {
				isNext = false;
			} else {
				isNext = true;
			}
		}
	} else if (wToken && wToken !== '0') {
		isNext = true;
	}

	console.log(isNext);
	if (auth) {
		if (isNext) {
			next();
		} else {
			const { fullPath } = to;
			console.log(fullPath);
			if (ua.match(/MicroMessenger/i)) {
				window.localStorage.setItem('token', '1010');
				window.location.replace(
					`http://hdwx.museum-edu.cn/wx_oauth?pid=22&vue_url=${fullPath}`
				);
				return;
			}
			next({
				path: '/login',
				query: {
					redirect: fullPath,
				},
			});
		}
	} else {
		next();
	}
});
export default router;
