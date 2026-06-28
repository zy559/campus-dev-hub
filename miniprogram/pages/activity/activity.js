const { LOCAL_POSTS_KEY, getLocalList, sections, posts, topPosts } = require("../../utils/mock");

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
    const allPosts = getLocalList(LOCAL_POSTS_KEY).concat(posts);
    this.setData({ posts: allPosts }, () => this.syncPosts());
  },

  onReady() {
    this.syncPosts();
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
    wx.navigateTo({ url: `/pages/post-detail/post-detail?id=${id}` });
  }
});
