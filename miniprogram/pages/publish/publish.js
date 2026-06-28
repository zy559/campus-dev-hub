const { getToken, request } = require("../../utils/request");
const { LOCAL_PROFILE_CARDS_KEY, LOCAL_POSTS_KEY, getLocalList } = require("../../utils/mock");

const templates = {
  比赛组队: "比赛/项目：\n目标：\n目前进度：\n缺少角色：\n时间安排：\n联系方式：",
  找搭子: "想找什么搭子：\n时间频率：\n地点：\n希望对方：\n联系方式：",
  找对象: "关于我：\n想认识：\n兴趣/生活节奏：\n希望怎么开始：",
  二手闲置: "物品：\n成色：\n价格：\n交易地点：\n补充说明："
};

Page({
  data: {
    mode: "card",
    title: "",
    content: "",
    nickname: "",
    school: "",
    intro: "",
    activeTemplate: "比赛组队",
    templateKeys: Object.keys(templates),
    submitting: false
  },

  setMode(event) {
    this.setData({ mode: event.currentTarget.dataset.mode });
  },

  input(event) {
    const key = event.currentTarget.dataset.key;
    this.setData({ [key]: event.detail.value });
  },

  selectTemplate(event) {
    this.setData({ activeTemplate: event.currentTarget.dataset.value });
  },

  applyTemplate() {
    this.setData({ content: templates[this.data.activeTemplate] });
  },

  chooseImage() {
    wx.chooseMedia({
      count: 1,
      mediaType: ["image"],
      success: () => wx.showToast({ title: "已选择图片", icon: "success" })
    });
  },

  submit() {
    if (this.data.submitting) return;
    if (this.data.mode === "card") {
      this.submitCard();
      return;
    }
    this.submitPost();
  },

  submitCard() {
    const nickname = this.data.nickname.trim();
    const intro = this.data.intro.trim();
    if (!nickname || !intro) {
      wx.showToast({ title: "请填写昵称和介绍", icon: "none" });
      return;
    }

    const card = {
      id: `local-card-${Date.now()}`,
      name: nickname,
      meta: this.data.school.trim() || "校园同学",
      needs: ["等待匹配", "同频交流"],
      interests: ["校园", "交友", "组队"],
      intro,
      signal: "新发布",
      imageTone: "teal",
      cover: ""
    };
    const next = [card].concat(getLocalList(LOCAL_PROFILE_CARDS_KEY));
    wx.setStorageSync(LOCAL_PROFILE_CARDS_KEY, next);
    wx.navigateTo({ url: `/pages/profile-card-detail/profile-card-detail?id=${card.id}` });
  },

  submitPost() {
    const title = this.data.title.trim();
    const content = this.data.content.trim();
    if (!title || !content) {
      wx.showToast({ title: "请填写标题和正文", icon: "none" });
      return;
    }

    if (!getToken()) {
      wx.showToast({ title: "未登录，已保存本地预览", icon: "none" });
      this.saveLocalPost(title, content);
      return;
    }

    this.setData({ submitting: true });
    request({
      url: "/api/posts",
      method: "POST",
      data: {
        title,
        content,
        tagIds: [],
        tagNames: [this.data.activeTemplate]
      }
    })
      .then((post) => {
        wx.showToast({ title: "发布成功", icon: "success" });
        wx.navigateTo({ url: `/pages/post-detail/post-detail?id=${post.id}&remote=1` });
      })
      .catch(() => {
        wx.showToast({ title: "发布失败，已存本地", icon: "none" });
        this.saveLocalPost(title, content);
      })
      .finally(() => {
        this.setData({ submitting: false });
      });
  },

  saveLocalPost(title, content) {
    const post = {
      id: `local-post-${Date.now()}`,
      title,
      content,
      author: "我",
      tag: this.data.activeTemplate,
      comments: 0,
      time: "刚刚"
    };
    const next = [post].concat(getLocalList(LOCAL_POSTS_KEY));
    wx.setStorageSync(LOCAL_POSTS_KEY, next);
    wx.navigateTo({ url: `/pages/post-detail/post-detail?id=${post.id}` });
  }
});
