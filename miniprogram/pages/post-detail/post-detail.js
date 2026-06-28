const { request } = require("../../utils/request");
const { LOCAL_POSTS_KEY, getLocalList, posts, postComments } = require("../../utils/mock");

function normalizeRemotePost(post) {
  return {
    id: post.id,
    title: post.title,
    content: post.content,
    author: post.author?.username || "同学",
    tag: post.tags?.[0]?.name || "动态",
    comments: post.commentCount || 0,
    time: "刚刚"
  };
}

Page({
  data: {
    post: null,
    comments: [],
    input: ""
  },

  onLoad(options) {
    if (options.remote === "1") {
      this.loadRemotePost(options.id);
      return;
    }
    this.loadLocalPost(options.id);
  },

  loadRemotePost(id) {
    request({ url: `/api/posts/${id}` })
      .then((post) => {
        const normalized = normalizeRemotePost(post);
        this.setData({
          post: normalized,
          comments: []
        });
      })
      .catch(() => {
        wx.showToast({ title: "读取线上帖子失败", icon: "none" });
        this.loadLocalPost(id);
      });
  },

  loadLocalPost(id) {
    const allPosts = getLocalList(LOCAL_POSTS_KEY).concat(posts);
    const postId = id || allPosts[0].id;
    const post = allPosts.find((item) => item.id === postId) || allPosts[0];
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
