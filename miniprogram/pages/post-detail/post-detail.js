const { LOCAL_POSTS_KEY, getLocalList, posts, postComments } = require("../../utils/mock");

Page({
  data: {
    post: null,
    comments: [],
    input: ""
  },

  onLoad(options) {
    const allPosts = getLocalList(LOCAL_POSTS_KEY).concat(posts);
    const id = options.id || allPosts[0].id;
    const post = allPosts.find((item) => item.id === id) || allPosts[0];
    this.setData({
      post,
      comments: postComments[post.id] || []
    });
  },

  input(event) {
    this.setData({ input: event.detail.value });
  },

  submitComment() {
    const content = this.data.input.trim();
    if (!content) {
      wx.showToast({ title: "先写点内容", icon: "none" });
      return;
    }
    const next = this.data.comments.concat({
      id: `comment-${Date.now()}`,
      author: "我",
      content,
      time: "刚刚"
    });
    this.setData({ comments: next, input: "" });
    wx.showToast({ title: "评论已发布", icon: "success" });
  },

  startChat() {
    wx.navigateTo({ url: "/pages/chat/chat?mode=normal" });
  }
});
