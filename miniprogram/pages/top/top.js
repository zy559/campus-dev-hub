const { topPosts } = require("../../utils/mock");

Page({
  data: {
    topPosts,
    todayHeat: topPosts.reduce((sum, item) => sum + item.heat, 0)
  },

  openPost(event) {
    const id = event.currentTarget.dataset.id;
    wx.navigateTo({ url: `/pages/post-detail/post-detail?id=${id}` });
  }
});
