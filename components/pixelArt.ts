// 展示物（ドット絵）の定義。1文字=1ドット、"." は透明。PixelIcon に palette と一緒に渡す

export const HERO = {
  rows: [
    "....KKKK....",
    "...KHHHHK...",
    "..KHHHHHHK..",
    "..KHSSSSHK..",
    "..KSKSSKSK..",
    "..KSSSSSSK..",
    "...KSSSSK...",
    "..KBBBBBBK..",
    ".KBBYYYYBBK.",
    ".KSKBBBBKSK.",
    "..KKBBBBKK..",
    "...KBBBBK...",
    "...KLKKLK...",
    "...KKK.KKK..",
  ],
  palette: { K: "#1b1233", H: "#7a4a1f", S: "#f4c79a", B: "#3a6df0", Y: "#ffd23f", L: "#6b4a2b" },
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
