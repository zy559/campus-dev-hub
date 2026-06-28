const { LOCAL_POSTS_KEY, getLocalList, posts } = require("../../utils/mock");

Page({
  data: {
    posts: []
  },

  onShow() {
    const localPosts = getLocalList(LOCAL_POSTS_KEY);
    this.setData({ posts: localPosts.length > 0 ? localPosts : posts });
  },

  openPost(event) {
    wx.navigateTo({ url: `/pages/post-detail/post-detail?id=${event.currentTarget.dataset.id}` });
  },

  goPublish() {
    wx.switchTab({ url: "/pages/publish/publish" });
  }
});
