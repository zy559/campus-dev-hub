Page({
  data: {
    name: "林同学",
    school: "北华航天工业学院 · 大三",
    bio: "想找到一起做项目、打比赛和认真交流的同学。",
    tags: ["前端", "摄影", "羽毛球", "数学建模"]
  },

  input(event) {
    const key = event.currentTarget.dataset.key;
    this.setData({ [key]: event.detail.value });
  },

  chooseAvatar() {
    wx.chooseMedia({
      count: 1,
      mediaType: ["image"],
      success: () => wx.showToast({ title: "头像已选择", icon: "success" })
    });
  },

  save() {
    wx.showToast({ title: "已保存", icon: "success" });
    setTimeout(() => wx.navigateBack(), 600);
  }
});
