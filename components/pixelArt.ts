// 展示物（ドット絵）の定義。1文字=1ドット、"." は透明。PixelIcon に palette と一緒に渡す

// 黒子（歌舞伎の黒衣）。全身を黒で塗り、暗い背景でも輪郭が見えるよう縁だけ少し明るい灰色にする
export const HERO = {
  rows: [
    "....GGGG....",
    "...GKKKKG...",
    "..GKKKKKKG..",
    "..GKKKKKKG..",
    "..GKKKKKKG..",
    "..GKKKKKKG..",
    "...GKKKKG...",
    "..GGKKKKGG..",
    ".GKKKGGKKKG.",
    ".GKGKKKKGKG.",
    "..GGKKKKGG..",
    "...GKKKKG...",
    "...GKGGKG...",
    "...GGG.GGG..",
  ],
  palette: { K: "#08080d", G: "#3a3a52" },
};

export const BOOK = {
  rows: [
    ".KKKKKKKKKK.",
    ".KRRRRRRRRK.",
    ".KRYYYYYYRK.",
    ".KRYKKKKYRK.",
    ".KRYKYYKYRK.",
    ".KRYKKKKYRK.",
    ".KRYYYYYYRK.",
    ".KRRRRRRRRK.",
    ".KKKKKKKKKK.",
    ".KWWWWWWWWK.",
    ".KKKKKKKKKK.",
  ],
  palette: { K: "#1b1233", R: "#b8323f", Y: "#ffd23f", W: "#f4ecd2" },
};

export const PAD = {
  rows: [
    "..KKKKKKKKKKKK..",
    ".KGGGGGGGGGGGGK.",
    "KGGGDGGGGGGGGGGK",
    "KGGDDDGGGGGGGRGK",
    "KGGGDGGGGGGRGGGK",
    "KGGGGGDDGDDGGGGK",
    ".KGGGGGGGGGGGGK.",
    "..KGGGGGGGGGGK..",
    "...KKKKKKKKKK...",
  ],
  palette: { K: "#1b1233", G: "#c9cbd6", D: "#3b3f55", R: "#e5384f" },
};
