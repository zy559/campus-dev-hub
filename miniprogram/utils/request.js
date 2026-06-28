const API_BASE_URL = "https://www.11111w.ltd";
const TOKEN_KEY = "weiluo_api_token";
const USER_KEY = "weiluo_api_user";

function getToken() {
  return wx.getStorageSync(TOKEN_KEY) || "";
}

function setAuth({ token, user }) {
  wx.setStorageSync(TOKEN_KEY, token);
  wx.setStorageSync(USER_KEY, user);
}

function clearAuth() {
  wx.removeStorageSync(TOKEN_KEY);
  wx.removeStorageSync(USER_KEY);
}

function request({ url, method = "GET", data, header = {} }) {
  const token = getToken();
  return new Promise((resolve, reject) => {
    wx.request({
      url: `${API_BASE_URL}${url}`,
      method,
      data,
      header: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...header
      },
      success(res) {
        if (res.statusCode === 401) {
          clearAuth();
          wx.showToast({ title: "请先登录", icon: "none" });
          reject(res);
          return;
        }
        if (res.statusCode < 200 || res.statusCode >= 300) {
          reject(res);
          return;
        }
        resolve(res.data);
      },
      fail: reject
    });
  });
}

function loginWithWechat() {
  return new Promise((resolve, reject) => {
    wx.login({
      success(loginRes) {
        if (!loginRes.code) {
          reject(new Error("wx.login 未返回 code"));
          return;
        }
        request({
          url: "/api/wechat/login",
          method: "POST",
          data: { code: loginRes.code }
        })
          .then((data) => {
            setAuth(data);
            resolve(data);
          })
          .catch(reject);
      },
      fail: reject
    });
  });
}

module.exports = {
  API_BASE_URL,
  TOKEN_KEY,
  USER_KEY,
  getToken,
  setAuth,
  clearAuth,
  request,
  loginWithWechat
};
