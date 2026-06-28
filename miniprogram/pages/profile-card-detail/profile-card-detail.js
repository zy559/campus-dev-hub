const { request } = require("../../utils/request");
const { LOCAL_PROFILE_CARDS_KEY, getLocalList, profileCards } = require("../../utils/mock");

Page({
  data: {
    card: null,
    liked: false
  },

  onLoad(options) {
    const id = options.id;
    const allCards = getLocalList(LOCAL_PROFILE_CARDS_KEY).concat(profileCards);
    const localCard = allCards.find((item) => item.id === id);
    if (localCard) {
      this.setData({ card: localCard });
      return;
    }

    if (id) {
      this.loadRemoteCard(id);
      return;
    }

    this.setData({ card: allCards[0] || null });
  },

  loadRemoteCard(id) {
    request({ url: `/api/profile-cards?id=${id}` })
      .then((res) => {
        this.setData({ card: res.card });
      })
      .catch(() => {
        wx.showToast({ title: "资料卡加载失败", icon: "none" });
      });
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
      content: "当前版本先支持发布和展示，线上删除会放到管理员与我的资料卡管理里统一处理。",
      confirmText: "知道了",
      showCancel: false
    });
  }
});
