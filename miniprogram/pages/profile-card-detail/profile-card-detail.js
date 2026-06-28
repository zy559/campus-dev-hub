const { LOCAL_PROFILE_CARDS_KEY, getLocalList, profileCards } = require("../../utils/mock");

Page({
  data: {
    card: null,
    liked: false
  },

  onLoad(options) {
    const allCards = getLocalList(LOCAL_PROFILE_CARDS_KEY).concat(profileCards);
    const id = options.id || allCards[0].id;
    const card = allCards.find((item) => item.id === id) || allCards[0];
    this.setData({ card });
  },

  likeCard() {
    this.setData({ liked: true });
    wx.showToast({ title: "已加入喜欢", icon: "success" });
  },

  startChat() {
    wx.navigateTo({ url: "/pages/chat/chat?mode=normal" });
  },

  privateChat() {
    wx.navigateTo({ url: "/pages/chat/chat?mode=private" });
  },

  editCard() {
    wx.switchTab({ url: "/pages/publish/publish" });
  },

  deleteCard() {
    wx.showModal({
      title: "删除资料卡",
      content: "当前是本地 mock 预览，接入后可删除真实资料卡。",
      confirmText: "知道了",
      showCancel: false
    });
  }
});
