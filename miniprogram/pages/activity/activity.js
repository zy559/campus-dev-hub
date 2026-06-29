const { normalizeImageUrl, request } = require("../../utils/request");
const { LOCAL_POSTS_KEY, getLocalList, sections, posts, topPosts } = require("../../utils/mock");

const IMAGE_MARKER = "[IMAGES]";
const MARKDOWN_IMAGE_RE = /!\[[^\]]*\]\(([^)]+)\)/g;

function parsePostMedia(content, fallbackImages) {
  const images = Array.isArray(fallbackImages) ? fallbackImages : [];
  const value = String(content || "");
  const markerIndex = value.indexOf(IMAGE_MARKER);
  if (markerIndex !== -1) {
    const text = value.slice(0, markerIndex).trim();
    const rawImages = value.slice(markerIndex + IMAGE_MARKER.length).trim();
    try {
      const parsed = JSON.parse(rawImages);
      return { content: text, images: Array.isArray(parsed) ? parsed.filter(Boolean) : images };
    } catch {
      return { content: text, images };
    }
  }

  const markdownImages = Array.from(value.matchAll(MARKDOWN_IMAGE_RE), (match) => match[1]).filter(Boolean);
  return {
    content: value.replace(MARKDOWN_IMAGE_RE, "").replace(/\n{3,}/g, "\n\n").trim(),
    images: markdownImages.length ? markdownImages : images
  };
}

function normalizePost(post, remote = false) {
  const media = parsePostMedia(post.content, post.images);
  return {
    id: post.id,
    title: post.title,
    content: media.content,
    images: media.images.map(normalizeImageUrl),
    author: post.author?.username || post.author || "同学",
    tag: post.tags?.[0]?.name || post.board?.name || post.tag || "动态",
    comments: post.commentCount || post.comments || 0,
    time: "刚刚",
    remote
  };
}

Page({
  data: {
    sections,
    activeSection: "全部",
    activeTag: "全部",
    currentChildren: [],
    topPost: topPosts[0],
    posts: [],
    visiblePosts: [],
    emptyText: ""
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
        const remotePosts = (data.posts || []).map((post) => normalizePost(post, true));
        const localPosts = getLocalList(LOCAL_POSTS_KEY).map((post) => normalizePost(post));
        this.setData({ posts: remotePosts.concat(localPosts) }, () => this.syncPosts());
      })
      .catch(() => {
        const fallbackPosts = getLocalList(LOCAL_POSTS_KEY)
          .concat(posts)
          .map((post) => normalizePost(post));
        this.setData({ posts: fallbackPosts }, () => this.syncPosts());
      });
  },

  selectAll() {
    this.setData({
      activeSection: "全部",
      activeTag: "全部",
      currentChildren: []
    }, () => this.syncPosts());
  },

  selectSection(event) {
    const activeSection = event.currentTarget.dataset.value;
    const section = sections.find((item) => item.title === activeSection) || sections[0];
    this.setData({
      activeSection,
      activeTag: "栏目全部",
      currentChildren: section.children
    }, () => this.syncPosts());
  },

  selectTag(event) {
    this.setData({ activeTag: event.currentTarget.dataset.value }, () => this.syncPosts());
  },

  syncPosts() {
    const { activeSection, activeTag, currentChildren, posts: allPosts } = this.data;
    let visiblePosts = allPosts;

    if (activeSection !== "全部") {
      if (activeTag === "栏目全部") {
        visiblePosts = allPosts.filter((post) => currentChildren.includes(post.tag));
      } else {
        visiblePosts = allPosts.filter((post) => post.tag === activeTag);
      }
    }

    this.setData({
      visiblePosts,
      emptyText: visiblePosts.length === 0 ? "这个栏目还没有内容，发第一条动态吧" : ""
    });
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
