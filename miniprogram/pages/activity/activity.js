const { request } = require("../../utils/request");
const { LOCAL_POSTS_KEY, getLocalList, sections, posts, topPosts } = require("../../utils/mock");

function normalizeRemotePost(post) {
  return {
    id: post.id,
    title: post.title,
    content: post.content,
    author: post.author?.username || "同学",
    tag: post.tags?.[0]?.name || post.board?.name || "动态",
    comments: post.commentCount || 0,
    time: "刚刚",
    remote: true
  };
}

Page({
  data: {
    sections,
    activeSection: "机会",
    activeTag: "全部",
    currentChildren: sections[0].children,
    topPost: topPosts[0],
    posts: [],
    visiblePosts: []
  },

  onLoad() {
    this.loadPosts();
  },

  onShow() {
    this.loadPosts();
  },

  loadPosts() {
    request({ url: "/api/posts?limit=20" })
      .then((data) => {
        const remotePosts = (data.posts || []).map(normalizeRemotePost);
        const localPosts = getLocalList(LOCAL_POSTS_KEY);
        this.setData({ posts: remotePosts.concat(localPosts) }, () => this.syncPosts());
      })
      .catch(() => {
        const fallbackPosts = getLocalList(LOCAL_POSTS_KEY).concat(posts);
        this.setData({ posts: fallbackPosts }, () => this.syncPosts());
      });
  },

  selectSection(event) {
    const activeSection = event.currentTarget.dataset.value;
    const section = sections.find((item) => item.title === activeSection) || sections[0];
    this.setData({
      activeSection,
      activeTag: "全部",
      currentChildren: section.children
    }, () => this.syncPosts());
  },

  selectTag(event) {
    this.setData({ activeTag: event.currentTarget.dataset.value }, () => this.syncPosts());
  },

  syncPosts() {
    const { activeTag, currentChildren } = this.data;
    const visiblePosts = this.data.posts.filter((post) => {
      if (activeTag !== "全部") return post.tag === activeTag;
      return currentChildren.includes(post.tag);
    });
    this.setData({ visiblePosts: visiblePosts.length > 0 ? visiblePosts : this.data.posts });
  },

  goPublish() {
    wx.switchTab({ url: "/pages/publish/publish" });
  },

  goTop() {
    wx.navigateTo({ url: "/pages/top/top" });
  },

  openPost(event) {
    const id = event.currentTarget.dataset.id;
    const remoteValue = event.currentTarget.dataset.remote;
    const remote = remoteValue === true || remoteValue === "true";
    wx.navigateTo({ url: `/pages/post-detail/post-detail?id=${id}${remote ? "&remote=1" : ""}` });
  }
});
