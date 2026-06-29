const { getToken, request } = require("../../utils/request");
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
    showGuide: true,
    loading: false
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
    const localCards = getLocalList(LOCAL_PROFILE_CARDS_KEY);
    this.setData({ loading: true });
    request({ url: "/api/profile-cards?limit=30" })
      .then((res) => {
        const remoteCards = Array.isArray(res.cards) ? res.cards : [];
        const allCards = remoteCards.concat(localCards, profileCards);
        this.setData({ allCards }, () => this.syncCards());
      })
      .catch(() => {
        const allCards = localCards.concat(profileCards);
        this.setData({ allCards }, () => this.syncCards());
      })
      .finally(() => {
        this.setData({ loading: false });
      });
  },

  getCurrentList() {
    const { activeFilter, allCards } = this.data;
    if (activeFilter === "全部") return allCards;
    return allCards.filter((card) => {
      const needs = Array.isArray(card.needs) ? card.needs.join(" ") : "";
      const interests = Array.isArray(card.interests) ? card.interests.join(" ") : "";
      const text = `${needs} ${interests} ${card.intro || ""}`;

      if (activeFilter === "找队友") {
        return /队友|组队|比赛|项目/.test(text);
      }
      if (activeFilter === "找朋友") {
        return /朋友|同好|兴趣|聊天|交流/.test(text);
      }
      return text.includes(activeFilter);
    });
  },

  syncCards() {
    const cards = this.getCurrentList();
    this.setData({
      cards,
      currentIndex: 0,
      currentCard: cards[0] || null
    });
  },

  selectFilter(event) {
    this.setData({ activeFilter: event.currentTarget.dataset.value }, () => this.syncCards());
  },

  nextCard() {
    if (!this.data.cards.length) return;
    const next = (this.data.currentIndex + 1) % this.data.cards.length;
    this.setData({
      currentIndex: next,
      currentCard: this.data.cards[next]
    });
  },

  likeCard() {
    if (!this.data.currentCard) return;
    wx.showToast({ title: "已加入喜欢", icon: "success" });
    this.nextCard();
  },

  startChat() {
    this.openConversation("normal");
  },

  privateChat() {
    this.openConversation("private");
  },

  openConversation(mode) {
    const card = this.data.currentCard;
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

  openCardDetail() {
    if (!this.data.currentCard) return;
    const remote = this.data.currentCard.remote ? "&remote=1" : "";
    wx.navigateTo({ url: `/pages/profile-card-detail/profile-card-detail?id=${this.data.currentCard.id}${remote}` });
  },

  closeGuide() {
    wx.setStorageSync("recommendGuideSeen", "1");
    this.setData({ showGuide: false });
  },

  goPublishCard() {
    wx.switchTab({ url: "/pages/publish/publish" });
  }
});
