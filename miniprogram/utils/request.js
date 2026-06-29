const API_BASE_URL = "https://www.11111w.ltd";
const TOKEN_KEY = "weiluo_api_token";
const USER_KEY = "weiluo_api_user";

function getToken() {
  return wx.getStorageSync(TOKEN_KEY) || "";
}

function getStoredUser() {
  return wx.getStorageSync(USER_KEY) || null;
}

function setAuth({ token, user }) {
  wx.setStorageSync(TOKEN_KEY, token);
  wx.setStorageSync(USER_KEY, user);
}

function clearAuth() {
  wx.removeStorageSync(TOKEN_KEY);
  wx.removeStorageSync(USER_KEY);
}

function handleResponse({ res, url, resolve, reject }) {
  if (res.statusCode === 401) {
    clearAuth();
    wx.showToast({ title: "请先登录", icon: "none" });
    console.error("request unauthorized", url, res.data);
    reject(res);
    return;
  }
  if (res.statusCode < 200 || res.statusCode >= 300) {
    console.error("request failed", url, res.statusCode, res.data);
    reject(res);
    return;
  }
  resolve(res.data);
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
        handleResponse({ res, url, resolve, reject });
      },
      fail: reject
    });
  });
}

function uploadFile({ filePath, name = "file" }) {
  const token = getToken();
  return new Promise((resolve, reject) => {
    wx.uploadFile({
      url: `${API_BASE_URL}/api/upload`,
      filePath,
      name,
      header: {
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      success(res) {
        let data = res.data;
        try {
          data = JSON.parse(res.data || "{}");
        } catch {
          data = {};
        }
        handleResponse({
          res: { statusCode: res.statusCode, data },
          url: "/api/upload",
          resolve,
          reject
        });
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
  getStoredUser,
  setAuth,
  clearAuth,
  request,
  uploadFile,
  loginWithWechat
};
