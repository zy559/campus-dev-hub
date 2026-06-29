const { request } = require("../../utils/request");
const { LOCAL_POSTS_KEY, getLocalList, posts } = require("../../utils/mock");

function normalizePost(post, remote = false) {
  return {
    id: post.id,
    title: post.title,
    content: post.content,
    author: post.author?.username || post.author || "同学",
    tag: post.tags?.[0]?.name || post.tag || "动态",
    comments: post.commentCount || post.comments || 0,
    time: "刚刚",
    remote
  };
}

Page({
  data: {
    posts: []
  },

  onShow() {
    request({ url: "/api/posts?limit=20" })
      .then((data) => {
        const remotePosts = (data.posts || []).map((post) => normalizePost(post, true));
        const localPosts = getLocalList(LOCAL_POSTS_KEY).map((post) => normalizePost(post));
        this.setData({ posts: remotePosts.concat(localPosts) });
      })
      .catch(() => {
        const localPosts = getLocalList(LOCAL_POSTS_KEY);
        this.setData({ posts: (localPosts.length > 0 ? localPosts : posts).map((post) => normalizePost(post)) });
      });
  },

  openPost(event) {
    const id = event.currentTarget.dataset.id;
    const remoteValue = event.currentTarget.dataset.remote;
    const remote = remoteValue === true || remoteValue === "true";
    wx.navigateTo({ url: `/pages/post-detail/post-detail?id=${id}${remote ? "&remote=1" : ""}` });
  },

  goPublish() {
    wx.switchTab({ url: "/pages/publish/publish" });
  }
});
