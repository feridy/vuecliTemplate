import { get, post } from './http';
// 用户登录
const login = params => post('users/register_bind', params);
export { login };
