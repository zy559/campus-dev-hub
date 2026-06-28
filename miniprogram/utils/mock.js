const LOCAL_PROFILE_CARDS_KEY = "weiluo_local_profile_cards";
const LOCAL_POSTS_KEY = "weiluo_local_posts";

const profileCards = [
  {
    id: "card-1",
    name: "林同学",
    meta: "大三 · 计算机",
    needs: ["找比赛队友", "找自习搭子", "项目搭子"],
    interests: ["前端", "羽毛球", "摄影", "数学建模"],
    intro: "最近想做一个校园小项目，也在准备比赛。希望找到认真但不内耗的队友，一起把事情推进。",
    signal: "校园匹配",
    imageTone: "teal",
    cover: ""
  },
  {
    id: "card-2",
    name: "周同学",
    meta: "研一 · 经管",
    needs: ["找对象", "找朋友", "找饭搭子"],
    interests: ["电影", "美食", "跑步", "音乐"],
    intro: "生活圈比较简单，想认识能一起吃饭、看电影、聊学习和未来计划的人。",
    signal: "轻松开口",
    imageTone: "sky",
    cover: ""
  },
  {
    id: "card-3",
    name: "陈同学",
    meta: "大二 · 自动化",
    needs: ["运动约局", "找搭子", "兴趣同好"],
    interests: ["篮球", "嵌入式", "骑行", "科幻"],
    intro: "想找能固定运动和一起做硬件小项目的同学，最好周末也有空。",
    signal: "同频同好",
    imageTone: "mint",
    cover: ""
  }
];

const sections = [
  {
    title: "机会",
    children: ["比赛组队", "实习内推", "活动讲座", "项目招募"]
  },
  {
    title: "学习",
    children: ["课程资料", "考研考公", "技术笔记", "问答求助"]
  },
  {
    title: "社交",
    children: ["找对象", "找搭子", "运动约局", "兴趣同好"]
  },
  {
    title: "生活",
    children: ["二手闲置", "美食推荐", "校园吐槽", "失物招领"]
  },
  {
    title: "展示",
    children: ["作品展示", "博客文章", "简历项目", "经验复盘"]
  }
];

const posts = [
  {
    id: "post-1",
    title: "蓝桥杯缺一个前端队友",
    content: "目标省奖，目前后端和算法已确定。希望找一个能做小程序或 Web 展示的同学。",
    author: "林同学",
    tag: "比赛组队",
    comments: 6,
    time: "刚刚"
  },
  {
    id: "post-2",
    title: "今晚图书馆三楼自习打卡",
    content: "考研数学 + 英语阅读，想找一个能稳定互相监督的搭子。",
    author: "周同学",
    tag: "找搭子",
    comments: 3,
    time: "12 分钟前"
  },
  {
    id: "post-3",
    title: "校园信息差收集：有哪些比赛值得参加？",
    content: "想整理一份适合低年级同学看的比赛清单，欢迎补充。",
    author: "陈同学",
    tag: "经验复盘",
    comments: 11,
    time: "1 小时前"
  }
];

const topPosts = posts.map((post, index) => ({
  ...post,
  rank: index + 1,
  heat: [96, 82, 74][index] || 60
}));

const postComments = {
  "post-1": [
    { id: "c1", author: "周同学", content: "我可以做小程序页面，之前做过校园工具类项目。", time: "5 分钟前" },
    { id: "c2", author: "陈同学", content: "建议把展示页和答辩 PPT 的结构一起提前定下来。", time: "刚刚" }
  ],
  "post-2": [
    { id: "c3", author: "林同学", content: "今晚七点可以，我也想找人互相监督。", time: "8 分钟前" }
  ],
  "post-3": [
    { id: "c4", author: "匿名同学", content: "可以补一个数学建模和互联网+的时间线。", time: "20 分钟前" },
    { id: "c5", author: "周同学", content: "这个如果整理出来，对低年级同学很有用。", time: "12 分钟前" }
  ]
};

const conversations = [
  {
    id: "chat-1",
    name: "周同学",
    last: "我们可以先约一个自习时间。",
    time: "10:24",
    privateMode: false
  },
  {
    id: "chat-2",
    name: "匿名同学",
    last: "我看到你的资料卡，想先了解一下。",
    time: "昨天",
    privateMode: true
  }
];

const messages = [
  { id: "m1", mine: false, text: "你好，我看到你的资料卡，感觉我们都对摄影感兴趣。", time: "10:20" },
  { id: "m2", mine: true, text: "可以呀，你平时喜欢拍什么？", time: "10:21" },
  { id: "m3", mine: false, text: "最近主要拍校园和日落，也想找人一起扫街。", time: "10:24" }
];

function getLocalList(key) {
  const value = wx.getStorageSync(key);
  return Array.isArray(value) ? value : [];
}

module.exports = {
  LOCAL_PROFILE_CARDS_KEY,
  LOCAL_POSTS_KEY,
  getLocalList,
  profileCards,
  sections,
  posts,
  topPosts,
  postComments,
  conversations,
  messages
};
