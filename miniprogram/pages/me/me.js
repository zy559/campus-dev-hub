const { clearAuth, getStoredUser, getToken, loginWithWechat } = require("../../utils/request");

const guestUser = {
  name: "未登录同学",
  school: "登录后同步你的校园身份",
  posts: 14,
  liked: 6,
  likedBy: 2,
  role: "user"
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
            school: apiUser.bio || "微信小程序已登录",
            role: apiUser.role || "user"
          }
        : guestUser
    });
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

  adminLogin() {
    wx.showModal({
      title: "管理员模拟登录",
      editable: true,
      placeholderText: "输入用户名",
      success(res) {
        if (res.confirm) {
          wx.showToast({ title: `已模拟：${res.content || "用户"}`, icon: "success" });
        }
      }
    });
  }
});
