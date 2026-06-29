const { request } = require("../../utils/request");
const { conversations: mockConversations } = require("../../utils/mock");

function formatConversation(item) {
  const otherUser = item.otherUser || {};
  return {
    id: item.id,
    name: otherUser.username || "同学",
    last: item.lastMessage ? item.lastMessage.content : "还没有消息，先打个招呼吧",
    time: item.lastMessage ? "刚刚" : "",
    avatar: otherUser.avatar || "",
    privateMode: false,
    remote: true
  };
}

Page({
  data: {
    conversations: mockConversations,
    loading: false
  },

  onShow() {
    this.loadConversations();
  },

  loadConversations() {
    this.setData({ loading: true });
    request({ url: "/api/conversations" })
      .then((items) => {
        const conversations = Array.isArray(items) ? items.map(formatConversation) : [];
        this.setData({ conversations: conversations.length ? conversations : mockConversations });
      })
      .catch(() => {
        this.setData({ conversations: mockConversations });
      })
      .finally(() => {
        this.setData({ loading: false });
      });
  },

  openChat(event) {
    const id = event.currentTarget.dataset.id || "";
    const mode = event.currentTarget.dataset.private ? "private" : "normal";
    const name = encodeURIComponent(event.currentTarget.dataset.name || "");
    wx.navigateTo({ url: `/pages/chat/chat?id=${id}&mode=${mode}&name=${name}` });
  },

  newChat() {
    wx.navigateTo({ url: "/pages/chat/chat?mode=normal" });
  }
});
