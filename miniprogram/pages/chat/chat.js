const { request } = require("../../utils/request");
const { messages: mockMessages } = require("../../utils/mock");

function formatMessage(message) {
  return {
    id: message.id,
    mine: Boolean(message.mine),
    text: message.content || message.text || "",
    time: message.createdAt ? "刚刚" : (message.time || "")
  };
}

Page({
  data: {
    conversationId: "",
    peerName: "同学",
    messages: mockMessages,
    mode: "normal",
    input: "",
    loading: false
  },

  onLoad(options) {
    const conversationId = options.id || "";
    const peerName = options.name ? decodeURIComponent(options.name) : "同学";
    this.setData({
      conversationId,
      peerName,
      mode: options.mode || "normal",
      messages: conversationId ? [] : mockMessages
    });
    if (conversationId) this.loadMessages();
  },

  loadMessages() {
    this.setData({ loading: true });
    request({ url: `/api/conversations/${this.data.conversationId}/messages` })
      .then((items) => {
        const messages = Array.isArray(items) ? items.map(formatMessage) : [];
        this.setData({ messages });
      })
      .catch(() => {
        wx.showToast({ title: "消息加载失败", icon: "none" });
      })
      .finally(() => {
        this.setData({ loading: false });
      });
  },

  input(event) {
    this.setData({ input: event.detail.value });
  },

  send() {
    const text = this.data.input.trim();
    if (!text) return;

    if (!this.data.conversationId) {
      const next = this.data.messages.concat({
        id: `m-${Date.now()}`,
        mine: true,
        text,
        time: "现在"
      });
      this.setData({ messages: next, input: "" });
      return;
    }

    request({
      url: `/api/conversations/${this.data.conversationId}/messages`,
      method: "POST",
      data: { content: text }
    })
      .then((message) => {
        const next = this.data.messages.concat(formatMessage(message));
        this.setData({ messages: next, input: "" });
      })
      .catch(() => {
        wx.showToast({ title: "发送失败", icon: "none" });
      });
  }
});
