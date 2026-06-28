const { LOCAL_PROFILE_CARDS_KEY, getLocalList, profileCards } = require("../../utils/mock");

const filters = ["全部", "找对象", "找搭子", "找队友", "找朋友"];

Page({
  data: {
    filters,
    activeFilter: "全部",
    allCards: profileCards,
    cards: profileCards,
    currentIndex: 0,
    currentCard: profileCards[0],
    showGuide: true
  },

  onLoad() {
    const seen = wx.getStorageSync("recommendGuideSeen");
    this.setData({ showGuide: !seen });
    this.loadCards();
  },

  onShow() {
    this.loadCards();
  },

  loadCards() {
    const allCards = getLocalList(LOCAL_PROFILE_CARDS_KEY).concat(profileCards);
    this.setData({ allCards }, () => this.syncCards());
  },

  getCurrentList() {
    const { activeFilter } = this.data;
    if (activeFilter === "全部") return this.data.allCards;
    const list = this.data.allCards.filter((card) => {
      if (activeFilter === "找队友") {
        return card.needs.some((item) => item.includes("队友") || item.includes("比赛"));
      }
      if (activeFilter === "找朋友") {
        return card.needs.some((item) => item.includes("朋友"));
      }
      return card.needs.some((item) => item.includes(activeFilter));
    });
    return list.length > 0 ? list : this.data.allCards;
  },

  syncCards() {
    const cards = this.getCurrentList();
    this.setData({
      cards,
      currentIndex: 0,
      currentCard: cards[0]
    });
  },

  selectFilter(event) {
    this.setData({ activeFilter: event.currentTarget.dataset.value }, () => this.syncCards());
  },

  nextCard() {
    const next = (this.data.currentIndex + 1) % this.data.cards.length;
    this.setData({
      currentIndex: next,
      currentCard: this.data.cards[next]
    });
  },

  likeCard() {
    wx.showToast({ title: "已加入喜欢", icon: "success" });
    this.nextCard();
  },

  startChat() {
    wx.navigateTo({ url: "/pages/chat/chat?mode=normal" });
  },

  privateChat() {
    wx.navigateTo({ url: "/pages/chat/chat?mode=private" });
  },

  openCardDetail() {
    wx.navigateTo({ url: `/pages/profile-card-detail/profile-card-detail?id=${this.data.currentCard.id}` });
  },

  closeGuide() {
    wx.setStorageSync("recommendGuideSeen", "1");
    this.setData({ showGuide: false });
  },

  goPublishCard() {
    wx.switchTab({ url: "/pages/publish/publish" });
  }
});
