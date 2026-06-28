const { profileCards } = require("../../utils/mock");

Page({
  data: {
    cards: profileCards.slice(1)
  },

  openCard(event) {
    wx.navigateTo({ url: `/pages/profile-card-detail/profile-card-detail?id=${event.currentTarget.dataset.id}` });
  }
});
