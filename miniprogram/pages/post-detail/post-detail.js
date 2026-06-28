const { getToken, request } = require("../../utils/request");
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

function normalizeRemoteComment(comment) {
  return {
    id: comment.id,
    author: comment.author?.username || "同学",
    content: comment.content,
    time: "刚刚"
  };
}

Page({
  data: {
    post: null,
    comments: [],
    input: "",
    isRemote: false,
    submitting: false
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
          isRemote: true
        });
        this.loadRemoteComments(normalized.id);
      })
      .catch(() => {
        wx.showToast({ title: "读取线上帖子失败", icon: "none" });
        this.loadLocalPost(id);
      });
  },

  loadRemoteComments(postId) {
    request({ url: `/api/comments?postId=${postId}` })
      .then((comments) => {
        this.setData({ comments: comments.map(normalizeRemoteComment) });
      })
      .catch(() => {
        wx.showToast({ title: "评论加载失败", icon: "none" });
        this.setData({ comments: [] });
      });
  },

  loadLocalPost(id) {
    const allPosts = getLocalList(LOCAL_POSTS_KEY).concat(posts);
    const postId = id || allPosts[0].id;
    const post = allPosts.find((item) => item.id === postId) || allPosts[0];
    this.setData({
      post,
      isRemote: false,
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
    if (this.data.isRemote && getToken()) {
      this.submitRemoteComment(content);
      return;
    }
    this.submitLocalComment(content);
  },

  submitRemoteComment(content) {
    if (this.data.submitting) return;
    this.setData({ submitting: true });
    request({
      url: "/api/comments",
      method: "POST",
      data: {
        postId: this.data.post.id,
        content
      }
    })
      .then(() => {
        this.setData({ input: "" });
        this.loadRemoteComments(this.data.post.id);
        wx.showToast({ title: "评论已发布", icon: "success" });
      })
      .catch((error) => {
        console.error("remote comment failed", error);
        wx.showToast({ title: "评论失败，请稍后重试", icon: "none" });
      })
      .finally(() => {
        this.setData({ submitting: false });
      });
  },

  submitLocalComment(content) {
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
