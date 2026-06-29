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

function getErrorMessage(error, fallback = "操作失败") {
  if (!error) return fallback;
  if (typeof error === "string") return error;
  const data = error.data || error.errMsg || error.message;
  if (typeof data === "string") return data || fallback;
  if (data && typeof data.error === "string") return data.error;
  if (data && typeof data.message === "string") return data.message;
  if (typeof error.errMsg === "string") return error.errMsg;
  return fallback;
}

function normalizeImageUrl(url) {
  const value = String(url || "").trim();
  if (!value || !/^https?:\/\//.test(value)) return value;
  if (value.startsWith(API_BASE_URL)) return value;
  return `${API_BASE_URL}/api/image-proxy?url=${encodeURIComponent(value)}`;
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
  return compressImage(filePath)
    .then((compressedPath) => readFileBase64(compressedPath))
    .then((base64) => request({
      url: "/api/upload",
      method: "POST",
      data: {
        base64,
        fileName: `${name}-${Date.now()}.jpg`,
        contentType: "image/jpeg"
      }
    }));
}

function compressImage(filePath) {
  return new Promise((resolve) => {
    if (!filePath || !wx.compressImage) {
      resolve(filePath);
      return;
    }
    wx.compressImage({
      src: filePath,
      quality: 72,
      success(res) {
        resolve(res.tempFilePath || filePath);
      },
      fail() {
        resolve(filePath);
      }
    });
  });
}

function readFileBase64(filePath) {
  return new Promise((resolve, reject) => {
    wx.getFileSystemManager().readFile({
      filePath,
      encoding: "base64",
      success(res) {
        resolve(res.data || "");
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
  getErrorMessage,
  normalizeImageUrl,
  request,
  uploadFile,
  loginWithWechat
};
