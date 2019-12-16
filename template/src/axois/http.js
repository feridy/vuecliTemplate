import axios from 'axios';
import qs from 'qs';
import { Loading, Toast } from 'vue-ydui/dist/lib.rem/dialog';

// 请求超时时间
axios.defaults.timeout = 12000;
// 请求的baseurl
axios.defaults.baseURL = process.env.VUE_APP_BASE_API;
// 设置请求头
axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=UTF-8';
axios.defaults.headers.Accept = 'application/json';
// axios 请求拦截器
axios.interceptors.request.use(config => {
	Loading.open('数据加载中');
	return config;
});
// axios response拦截器
axios.interceptors.response.use(
	response => {
		Loading.close();

		if (response.status === 200 && response.data.status === 1) {
			return Promise.resolve(response);
		}
		if (response.data.status === 405) {
			Toast({
				mes: response.data.msg,
				icon: 'error',
				timeout: 1500,
				callback: () => {
					window.localStorage.setItem('token', '0');
					window.location.reload();
				},
			});
			return Promise.reject(response);
		}
		Toast({
			mes: response.data.msg,
			icon: 'error',
			timeout: 2000,
		});
		return Promise.reject(response);
	},
	error => {
		Loading.close();
		// 超时捕获
		if (error.code === 'ECONNABORTED') {
			Toast({
				mes: '请求超时，请重新刷新页面',
				icon: 'error',
				timeout: 2000,
			});
			return Promise.reject(error.response);
		}
		const responseCode = error.response.status;
		switch (responseCode) {
			// 404请求不存在
			case 404:
				Toast({
					mes: '请求不存在',
					icon: 'error',
					timeout: 5000,
				});
				break;
			default:
				Toast({
					mes: error.response.data.msg,
					icon: 'error',
					timeout: 2000,
				});
		}

		return Promise.reject(error.response);
	}
);

/**
 * 封装get方法，对应get请求
 * @param {String} url [请求的url地址]
 * @param {Object} params [请求时携带的参数]
 */
function get(url, params = {}) {
	const initParams = { p: 'w', pid: process.env.VUE_APP_PID, language: 1 };

	Object.assign(initParams, params);

	return new Promise((resolve, reject) => {
		axios
			.get(url, {
				params: initParams,
			})
			.then(res => {
				resolve(res.data);
			})
			.catch(err => {
				console.log(err);
				reject(err.data);
			});
	});
	// 或者return axios.get();
}
/**
 * post方法，对应post请求
 * @param {String} url [请求的url地址]
 * @param {Object} params [请求时携带的参数]
 * @param {Object} config [文件上传时的请求配置{header: 'Content-Type': 'multipart/form-data'}]
 */
function post(url, params = {}, config) {
	const initParams = { p: 'w', pid: process.env.VUE_APP_PID, language: 1 };

	Object.assign(initParams, params);

	let formData = new FormData();

	if (config) {
		const entries = Object.entries(initParams);

		entries.forEach(item => {
			formData.append(item[0], item[1]);
		});
	} else {
		formData = qs.stringify(initParams);
	}

	return new Promise((resolve, reject) => {
		axios
			.post(url, formData, config)
			.then(res => {
				resolve(res.data);
			})
			.catch(err => {
				reject(err.data);
			});
	});
	//  或者return axios.post();
}

export { get, post };
