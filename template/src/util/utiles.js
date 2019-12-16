/* eslint-disable */
const getCookiValue = (name) => {
  if (!document.cookie.trim().length) {
    return null;
  }
  const cookieAll = document.cookie.split('; ');
  const obj = {};
  cookieAll.forEach((item) => {
    const list = item.trim().split('=');
    // eslint-disable-next-line prefer-destructuring
    obj.list[0] = list[1];
  });
  return obj[name];
};

export default {
  getCookiValue,
};
