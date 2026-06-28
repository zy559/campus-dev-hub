Page({
  data: {
    user: {
      name: "林同学",
      school: "北华航天工业学院",
      posts: 14,
      liked: 6,
      likedBy: 2,
      role: "admin"
    },
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
