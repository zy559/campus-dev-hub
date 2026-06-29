const { request } = require("../../utils/request");

const IMAGE_MARKER = "[IMAGES]";
const MARKDOWN_IMAGE_RE = /!\[[^\]]*\]\(([^)]+)\)/g;

function parsePostText(content) {
  const value = String(content || "");
  const markerIndex = value.indexOf(IMAGE_MARKER);
  const text = markerIndex === -1 ? value : value.slice(0, markerIndex);
  return text.replace(MARKDOWN_IMAGE_RE, "").replace(/\n{3,}/g, "\n\n").trim();
}

function formatDate(value) {
  if (!value) return "刚刚";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "刚刚";
  return `${date.getMonth() + 1}-${date.getDate()} ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

function normalizePost(post) {
  return {
    id: post.id,
    title: post.title || "未命名动态",
    content: parsePostText(post.content).slice(0, 90),
    author: post.author?.username || "同学",
    tag: post.tags?.[0]?.name || "动态",
    comments: post.commentCount || 0,
    time: formatDate(post.createdAt)
  };
}

function normalizeCard(card) {
  return {
    id: card.id,
    name: card.name || "未命名资料卡",
    meta: card.meta || "校园同学",
    intro: String(card.intro || "").slice(0, 90),
    author: card.author?.username || "同学",
    cover: card.cover || "",
    time: formatDate(card.createdAt)
  };
}

Page({
  data: {
    loading: false,
    activeTab: "posts",
    usersCount: 0,
    posts: [],
    profileCards: []
  },

  onShow() {
    this.loadData();
  },

  loadData() {
    if (this.data.loading) return;
    this.setData({ loading: true });
    request({ url: "/api/admin/mini-data" })
      .then((data) => {
        this.setData({
          usersCount: data.usersCount || 0,
          posts: (data.posts || []).map(normalizePost),
          profileCards: (data.profileCards || []).map(normalizeCard)
        });
      })
      .catch((error) => {
        const status = error && error.statusCode;
        wx.showToast({ title: status === 403 ? "当前账号不是管理员" : "管理数据加载失败", icon: "none" });
      })
      .finally(() => {
        this.setData({ loading: false });
      });
  },

  switchTab(event) {
    this.setData({ activeTab: event.currentTarget.dataset.tab });
  },

  openPost(event) {
    wx.navigateTo({ url: `/pages/post-detail/post-detail?id=${event.currentTarget.dataset.id}&remote=1` });
  },

  openCard(event) {
    wx.navigateTo({ url: `/pages/profile-card-detail/profile-card-detail?id=${event.currentTarget.dataset.id}&remote=1` });
  },

  deletePost(event) {
    const id = event.currentTarget.dataset.id;
    this.confirmDelete("删除帖子", "删除后帖子和评论都会移除。", () => {
      request({ url: `/api/posts/${id}`, method: "DELETE" })
        .then(() => {
          wx.showToast({ title: "已删除", icon: "success" });
          this.loadData();
        })
        .catch(() => wx.showToast({ title: "删除失败", icon: "none" }));
    });
  },

  deleteCard(event) {
    const id = event.currentTarget.dataset.id;
    this.confirmDelete("删除资料卡", "删除后推荐页不再展示这张资料卡。", () => {
      request({ url: `/api/profile-cards?id=${id}`, method: "DELETE" })
        .then(() => {
          wx.showToast({ title: "已删除", icon: "success" });
          this.loadData();
        })
        .catch(() => wx.showToast({ title: "删除失败", icon: "none" }));
    });
  },

  confirmDelete(title, content, onConfirm) {
    wx.showModal({
      title,
      content,
      confirmText: "删除",
      confirmColor: "#dc2626",
      success: (res) => {
        if (res.confirm) onConfirm();
      }
    });
  }
});
