const { getToken, request } = require("../../utils/request");
const { LOCAL_PROFILE_CARDS_KEY, getLocalList, profileCards } = require("../../utils/mock");

Page({
  data: {
    card: null,
    liked: false,
    canEdit: false,
    canDelete: false
  },

  onLoad(options) {
    const id = options.id;
    const allCards = getLocalList(LOCAL_PROFILE_CARDS_KEY).concat(profileCards);
    const localCard = allCards.find((item) => item.id === id);
    if (localCard) {
      this.setData({ card: localCard, canEdit: true, canDelete: true });
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
        const card = res.card || null;
        this.setData({
          card,
          canEdit: Boolean(card && card.canEdit),
          canDelete: Boolean(card && card.canDelete)
        });
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
    this.openConversation("normal");
  },

  privateChat() {
    this.openConversation("private");
  },

  openConversation(mode) {
    const card = this.data.card;
    const participantId = card && card.author && card.author.id;
    if (!participantId || !getToken()) {
      wx.navigateTo({ url: `/pages/chat/chat?mode=${mode}` });
      return;
    }

    request({
      url: "/api/conversations",
      method: "POST",
      data: { participantId }
    })
      .then((conversation) => {
        const name = conversation.otherUser ? encodeURIComponent(conversation.otherUser.username) : "";
        wx.navigateTo({ url: `/pages/chat/chat?id=${conversation.id}&mode=${mode}&name=${name}` });
      })
      .catch(() => {
        wx.showToast({ title: "发起聊天失败", icon: "none" });
      });
  },

  editCard() {
    const card = this.data.card;
    if (!this.data.canEdit) {
      wx.showToast({ title: "无权编辑这张资料卡", icon: "none" });
      return;
    }
    if (card && card.remote) {
      wx.setStorageSync("weiluo_editing_profile_card_id", card.id);
      wx.switchTab({ url: "/pages/publish/publish" });
      return;
    }
    wx.switchTab({ url: "/pages/publish/publish" });
  },

  deleteCard() {
    const card = this.data.card;
    if (!card) return;
    if (!this.data.canDelete) {
      wx.showToast({ title: "无权删除这张资料卡", icon: "none" });
      return;
    }

    wx.showModal({
      title: "删除资料卡",
      content: "删除后推荐页将不再展示这张资料卡。",
      confirmText: "删除",
      confirmColor: "#dc2626",
      success: (res) => {
        if (!res.confirm) return;
        if (!card.remote) {
          const next = getLocalList(LOCAL_PROFILE_CARDS_KEY).filter((item) => item.id !== card.id);
          wx.setStorageSync(LOCAL_PROFILE_CARDS_KEY, next);
          wx.navigateBack();
          return;
        }
        request({ url: `/api/profile-cards?id=${card.id}`, method: "DELETE" })
          .then(() => {
            wx.showToast({ title: "已删除", icon: "success" });
            wx.navigateBack();
          })
          .catch(() => {
            wx.showToast({ title: "删除失败", icon: "none" });
          });
      }
    });
  }
});
