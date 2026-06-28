const { conversations } = require("../../utils/mock");

Page({
  data: {
    conversations
  },

  openChat(event) {
    const mode = event.currentTarget.dataset.private ? "private" : "normal";
    wx.navigateTo({ url: `/pages/chat/chat?mode=${mode}` });
  },

  newChat() {
    wx.navigateTo({ url: "/pages/chat/chat?mode=normal" });
  }
});
