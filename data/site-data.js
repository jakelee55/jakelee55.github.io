const ASSET_BASE = "https://game.gtimg.cn/images/timi/web202312/";

window.SITE_DATA = {
  brand: {
    name: "米饭联盟成都分部",
    logo: "assets/site-logo.png",
    heroBackground: "assets/home-background-2.png",
    slogan: "assets/slogan-bottom.png",
    sourceSite: "https://timi.qq.com/"
  },

  nav: [
    { id: "home", label: "首页" },
    { id: "definition", label: "米饭联盟成都分部" },
    { id: "featured", label: "活动回顾" },
    { id: "moments", label: "TiMi一下" },
    { id: "join", label: "加入我们" }
  ],

  socials: [
    { label: "微信", icon: "assets/wechat-icon.png", qr: "assets/wechat-account.png" },
    { label: "QQ", icon: "assets/qq-icon.png", qr: "assets/q-group.png" },
    { label: "小红书", icon: "assets/xiaohongshu-icon.png", qr: "assets/xiaohongshu-qr.png" },
    { label: "抖音", icon: "assets/douyin-icon.png", qr: "assets/douyin-qr.png" }
  ],

  definition: {
    background: "assets/rice-alliance-main.png",
    words: [
      { image: "assets/rice-word-1.png", className: "definition-word-one", alt: "米饭联盟" },
      { image: "assets/rice-word-2.png", className: "definition-word-two", alt: "成都分部" }
    ]
  },

  featured: {
    background: "assets/featured-page-background.png",
    barrage: {
      image: "assets/featured-barrage-gift-box-display.jpg",
      images: [
        "assets/featured-barrage-gift-box-display.jpg",
        "assets/featured-photo-delta-club-2.jpg",
        "assets/featured-photo-gift-box-4.jpg",
        "assets/featured-photo-delta-club-1.jpg",
        "assets/featured-photo-naixue-1.jpg",
        "assets/featured-photo-worldline-1.jpg",
        "assets/featured-photo-gift-box-3.jpg",
        "assets/featured-photo-naixue-2.jpg",
        "assets/featured-photo-gift-box-2.jpg",
        "assets/featured-photo-comic-expo-2.jpg",
        "assets/featured-photo-comic-expo-1.jpg",
        "assets/featured-photo-wangzhe-10th-8.jpg",
        "assets/featured-photo-wangzhe-10th-3.jpg",
        "assets/featured-photo-wangzhe-10th-1.jpg",
        "assets/featured-photo-wangzhe-10th-4.jpg",
        "assets/featured-photo-wangzhe-10th-6.jpg",
        "assets/featured-photo-wangzhe-10th-2.jpg",
        "assets/featured-photo-wangzhe-10th-5.jpg",
        "assets/featured-photo-wangzhe-10th-7.jpg",
        "assets/featured-photo-kpl-2025-2.jpg",
        "assets/featured-photo-kpl-2025-3.jpg",
        "assets/featured-photo-kpl-2025-1.jpg",
        "assets/featured-photo-wangzhe-10th-11.jpg",
        "assets/featured-photo-wangzhe-10th-10.jpg",
        "assets/featured-photo-wangzhe-10th-12.jpg",
        "assets/featured-photo-wangzhe-10th-9.jpg"
      ],
      interval: 2600,
      speed: 95,
      lanes: 5,
      batchMax: 2
    }
  },

  moments: {
    background: "assets/moments-bg.jpg",
    decoLeft: "assets/moments-deco-left.png",
    decoRight: "assets/moments-deco-right.png",
    items: [
      {
        title: "王者十周年留影",
        image: "assets/moment-wangzhe-10th.jpg",
        className: "moment-card-one",
        depth: "0.60"
      },
      {
        title: "三角洲留影",
        image: "assets/moment-delta.jpg",
        className: "moment-card-two",
        depth: "0.40"
      },
      {
        title: "2025KPL年总留影",
        image: "assets/moment-kpl-2025.jpg",
        className: "moment-card-three",
        depth: "0.20"
      },
      {
        title: "小王礼物盒留影",
        image: "assets/moment-gift-box.jpg",
        className: "moment-card-four",
        depth: "0.50"
      }
    ]
  },

  join: {
    person: "assets/join-person-new.png",
    cards: [
      {
        title: "合作咨询",
        index: "01",
        qr: "assets/join-card-weixin-qr.png",
        href: "https://careers.tencent.com/home.html",
        external: true
      },
      {
        title: "加入Q群",
        index: "02",
        qr: "assets/join-card-qq-qr.png",
        heading: "提升全球玩家娱乐品质",
        body: "米饭联盟成都分部致力于在不同活动中打造兼具热爱、创作和情感连接的体验。这里适合热爱创作、愿意和团队共同探索边界的人。"
      },
      {
        title: "关注小红书",
        index: "03",
        qr: "assets/join-card-xiaohongshu-qr.png",
        heading: "持续成长的创作团队",
        body: "从多个经典产品到全球化研发网络，团队持续积累跨平台、跨品类和跨文化协作经验。"
      },
      {
        title: "关注抖音",
        index: "04",
        qr: "assets/join-card-douyin-qr.png",
        heading: "以作品回应热爱",
        body: "多款产品在玩家口碑、赛事影响力、技术创新与文化传播方面获得认可。"
      }
    ]
  },

  videos: {
    brand: {
      titleLines: ["米饭联盟", "成都分部"],
      body: "欢迎小伙伴成为米饭的一员！",
      iframeSrc: "https://player.bilibili.com/player.html?isOutside=true&aid=116923538869507&bvid=BV1VDNi6kEhY&cid=39975977608&p=1"
    }
  },

  footer: {
    copyright: "COPYRIGHT © 1998 - 2026 TENCENT. ALL RIGHTS RESERVED.",
    note: "本地静态复刻模板，素材与链接可在 data/site-data.js 中替换。"
  }
};
