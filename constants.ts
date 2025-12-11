import { Blessing } from './types';

export const COLORS = {
  DEEP_SEA: '#001d3d',
  CINNABAR: '#aa2222', // Zhu Sha Hong
  GOLD: '#ffd700',
  PAPER: '#f4e4bc', // Yellow Kraft Paper
};

export const BLESSINGS: Blessing[] = [
  {
    title: "马到成功",
    level: "上上签",
    poetry: [
      "天马行空踏云开",
      "万里鹏程自此来",
      "春风得意蹄疾处",
      "繁花似锦向阳开"
    ]
  },
  {
    title: "龙马精神",
    level: "中吉签",
    poetry: [
      "金羁络头且徐行",
      "壮志凌云万里情",
      "只有天边明月好",
      "照人长夜作长庚"
    ]
  },
  {
    title: "一马当先",
    level: "上吉签",
    poetry: [
      "且将新火试新茶",
      "诗酒趁年华",
      "策马扬鞭何所惧",
      "人生处处是天涯"
    ]
  },
  {
    title: "福至心灵",
    level: "大吉签",
    poetry: [
      "瑞雪纷飞兆丰年",
      "红梅傲骨映窗前",
      "心有灵犀通百脉",
      "福禄寿喜满人间"
    ]
  }
];

export const FONTS = {
  SERIF: "'Noto Serif SC', serif",
  SANS: "'Noto Sans SC', sans-serif",
  CALLIGRAPHY: "'Ma Shan Zheng', cursive",
};
