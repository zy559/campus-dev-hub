const { clearAuth, getStoredUser, getToken, loginWithWechat, request, setAuth } = require("../../utils/request");

const ADMIN_AUTH_BACKUP_KEY = "weiluo_admin_auth_backup";

const guestUser = {
  name: "未登录同学",
  school: "登录后同步你的校园身份",
  posts: 14,
  liked: 6,
  likedBy: 2,
  role: "user",
  impersonating: false
};

Page({
  data: {
    isLoggedIn: false,
    loginLoading: false,
    user: guestUser,
    highlights: [
      { label: "同频匹配", value: "82%" },
      { label: "活跃天数", value: "12" },
      { label: "校园声望", value: "A" }
    ],
    menus: [
      { label: "个人资料", path: "/pages/profile-edit/profile-edit" },
      { label: "我的帖子", path: "/pages/me-posts/me-posts" },
      { label: "我喜欢的", path: "/pages/me-liked/me-liked" },
      { label: "喜欢我的", path: "/pages/me-liked-by/me-liked-by" },
      { label: "历史评论", path: "" },
      { label: "我的收藏", path: "" },
      { label: "建议反馈", path: "" },
      { label: "隐私政策", path: "" }
    ]
  },

  onShow() {
    this.syncAuthState();
    this.refreshProfile();
  },

  syncAuthState() {
    const apiUser = getStoredUser();
    const isLoggedIn = Boolean(getToken() && apiUser);
    this.setData({
      isLoggedIn,
      user: isLoggedIn
        ? {
            ...guestUser,
            name: apiUser.username || "微信用户",
            school: apiUser.impersonating ? "管理员代登录中" : (apiUser.bio || "微信小程序已登录"),
            role: apiUser.role || "user",
            impersonating: Boolean(apiUser.impersonating)
          }
        : guestUser
    });
  },

  refreshProfile() {
    if (!getToken()) return;
    request({ url: "/api/user/profile" })
      .then((data) => {
        if (!data.user) return;
        const current = getStoredUser() || {};
        setAuth({
          token: getToken(),
          user: {
            ...current,
            ...data.user,
            impersonating: Boolean(current.impersonating),
            impersonatorId: current.impersonatorId,
            impersonatorName: current.impersonatorName
          }
        });
        this.syncAuthState();
      })
      .catch(() => {});
  },

  login() {
    if (this.data.loginLoading) return;
    this.setData({ loginLoading: true });
    loginWithWechat()
      .then(() => {
        this.syncAuthState();
        wx.showToast({ title: "登录成功", icon: "success" });
      })
      .catch(() => {
        wx.showToast({ title: "微信登录失败", icon: "none" });
      })
      .finally(() => {
        this.setData({ loginLoading: false });
      });
  },

  logout() {
    clearAuth();
    wx.removeStorageSync(ADMIN_AUTH_BACKUP_KEY);
    this.syncAuthState();
    wx.showToast({ title: "已退出登录", icon: "success" });
  },

  openMenu(event) {
    const path = event.currentTarget.dataset.path;
    if (path) {
      wx.navigateTo({ url: path });
      return;
    }
    wx.showToast({ title: "后续接入真实数据", icon: "none" });
  },

  impersonateUser() {
    wx.showModal({
      title: "管理员代登录",
      editable: true,
      placeholderText: "输入用户名 / 邮箱 / 用户ID",
      success: (res) => {
        const query = String(res.content || "").trim();
        if (!res.confirm || !query) return;

        const currentToken = getToken();
        const currentUser = getStoredUser();
        if (!currentToken || !currentUser) {
          wx.showToast({ title: "请先登录管理员账号", icon: "none" });
          return;
        }

        wx.setStorageSync(ADMIN_AUTH_BACKUP_KEY, { token: currentToken, user: currentUser });
        request({
          url: "/api/admin/impersonate",
          method: "POST",
          data: { query }
        })
          .then((data) => {
            setAuth(data);
            this.syncAuthState();
            wx.showToast({ title: `已切换：${data.user.username}`, icon: "success" });
          })
          .catch(() => {
            wx.removeStorageSync(ADMIN_AUTH_BACKUP_KEY);
            wx.showToast({ title: "代登录失败", icon: "none" });
          });
      }
    });
  },

  restoreAdmin() {
    const backup = wx.getStorageSync(ADMIN_AUTH_BACKUP_KEY);
    if (!backup || !backup.token || !backup.user) {
      wx.showToast({ title: "请重新登录管理员", icon: "none" });
      return;
    }
    setAuth(backup);
    wx.removeStorageSync(ADMIN_AUTH_BACKUP_KEY);
    this.syncAuthState();
    wx.showToast({ title: "已返回管理员", icon: "success" });
  }
});
