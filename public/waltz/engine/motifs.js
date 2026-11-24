// 旋律の断片。音は [開始単位, 度数, 長さ]（8分音符単位、1小節 = 6単位、ふつうは2小節 = 12単位。bars: 8 の断片は1フレーズ全体）。
// 度数は主音 = 1。出典を書いた断片は、著作権の切れた原曲の冒頭の音高を引用したもの（リズムは3拍子用に調整・自作の場合あり）。
// 出典なしの断片は自作。
// verified: 公開されている楽譜データ（Mutopia・Wikipedia 掲載の浄書）で音高を確認できたものだけ true。
// 楽譜原本との照合ではなく、リズムが近似の断片もある。家路は音名表記のみの確認で false。
// 公開・商用利用の前に要確認。

const PITCH_VERIFIED_IDS = new Set([
  'minuet', 'lullaby', 'lullaby-answer', 'elise', 'ode-a', 'ode-b', 'twinkle', 'grace-a', 'grace-b',
  'canon-a', 'canon-b', 'canon-c', 'minute-a', 'minute-b',
]);

export const MOTIFS = [
  {
    id: 'minuet',
    label: 'メヌエット風',
    origin: 'ペッツォルト作とされるト長調のメヌエットの冒頭2小節の引用（音高・リズム）',
    hint: 'stately and bright, rising scale after a leap down',
    moods: ['bright', 'nostalgic'],
    notes: [[0, 5, 2], [2, 1, 1], [3, 2, 1], [4, 3, 1], [5, 4, 1], [6, 5, 2], [8, 1, 2], [10, 1, 2]],
  },
  {
    id: 'lullaby',
    label: '子守唄風',
    origin: 'ブラームス「子守唄」の冒頭の引用（音高）',
    hint: 'gentle rocking repeated 3-3-5 figure, very soothing',
    moods: ['tender', 'calm'],
    notes: [[0, 3, 1], [1, 3, 1], [2, 5, 4], [6, 3, 1], [7, 3, 1], [8, 5, 4]],
  },
  {
    id: 'lullaby-answer',
    label: '子守唄風（応答）',
    origin: 'ブラームス「子守唄」の続きの引用（音高）',
    hint: 'soft answer phrase that climbs and settles',
    moods: ['tender', 'calm', 'nostalgic'],
    notes: [[0, 3, 1], [1, 5, 1], [2, 8, 2], [4, 7, 2], [6, 6, 2], [8, 6, 2], [10, 5, 2]],
  },
  {
    id: 'elise',
    label: 'エリーゼ風',
    origin: 'ベートーヴェン「エリーゼのために」の冒頭の引用（音高。第4音の半音上げは省略）',
    hint: 'wistful back-and-forth wobble, nostalgic',
    moods: ['nostalgic', 'tender'],
    notes: [[0, 5, 1], [1, 4, 1], [2, 5, 1], [3, 4, 1], [4, 5, 1], [5, 2, 1], [6, 4, 1], [7, 3, 1], [8, 1, 4]],
  },
  {
    id: 'ode-a',
    label: '歓喜の歌風（前半）',
    origin: 'ベートーヴェン「歓喜の歌」の主題の最初の6音の引用（音高・リズム）',
    hint: 'bright stepwise melody, familiar and cheerful',
    moods: ['bright'],
    notes: [[0, 3, 2], [2, 3, 2], [4, 4, 2], [6, 5, 2], [8, 5, 2], [10, 4, 2]],
  },
  {
    id: 'ode-b',
    label: '歓喜の歌風（後半）',
    origin: 'ベートーヴェン「歓喜の歌」の主題の7〜12音目の引用（音高・リズム）',
    hint: 'stepwise descent back home, cheerful and calm',
    moods: ['bright', 'calm'],
    notes: [[0, 3, 2], [2, 2, 2], [4, 1, 2], [6, 1, 2], [8, 2, 2], [10, 3, 2]],
  },
  {
    id: 'rise',
    label: '分散和音の上昇',
    origin: '古典派ワルツの定型（出典なし）',
    hint: 'broken-chord rise, open and bright',
    moods: ['bright', 'calm'],
    notes: [[0, 1, 2], [2, 3, 2], [4, 5, 2], [6, 8, 4], [10, 7, 2]],
  },
  {
    id: 'sigh',
    label: 'ため息型',
    origin: '古典派の下行2音（出典なし）',
    hint: 'slow falling two-note sighs, very calm',
    moods: ['calm', 'tender', 'nostalgic'],
    notes: [[0, 5, 3], [3, 4, 3], [6, 3, 3], [9, 2, 3]],
  },
  {
    id: 'turn',
    label: '回音型',
    origin: '古典派の装飾音型（出典なし）',
    hint: 'repeated note with a small turn, graceful',
    moods: ['bright', 'nostalgic'],
    notes: [[0, 5, 2], [2, 5, 1], [3, 6, 1], [4, 5, 1], [5, 4, 1], [6, 3, 4], [10, 2, 2]],
  },
  {
    id: 'leap',
    label: '跳躍と下行',
    origin: 'ロマン派の歌謡的旋律型（出典なし）',
    hint: 'romantic sixth leap then stepwise fall',
    moods: ['nostalgic', 'tender'],
    notes: [[0, 1, 2], [2, 6, 4], [6, 5, 2], [8, 4, 2], [10, 3, 2]],
  },
  {
    id: 'dance',
    label: 'ワルツの定型',
    origin: '19世紀ウィンナ・ワルツの定型（出典なし）',
    hint: 'lively waltz lilt, light and graceful',
    moods: ['bright'],
    notes: [[0, 1, 1], [1, 3, 1], [2, 5, 2], [4, 5, 2], [6, 6, 2], [8, 5, 2], [10, 3, 2]],
  },
  {
    id: 'bells',
    label: '鐘の下行',
    origin: '下行音階の定型（出典なし）',
    hint: 'high bell-like notes drifting down, peaceful',
    moods: ['calm', 'tender'],
    notes: [[0, 8, 2], [2, 7, 2], [4, 5, 2], [6, 6, 4], [10, 5, 2]],
  },
  {
    id: 'pastoral',
    label: '牧歌風',
    origin: '牧歌的な旋律の定型（出典なし）',
    hint: 'pastoral lilt with long relaxed notes',
    moods: ['calm', 'nostalgic', 'tender'],
    notes: [[0, 3, 3], [3, 3, 1], [4, 4, 1], [5, 3, 1], [6, 2, 3], [9, 1, 3]],
  },
  {
    id: 'twinkle',
    label: 'きらきら星風',
    origin: 'フランス民謡「きらきら星」の冒頭の引用（音高・リズム）',
    hint: 'simple childlike tune, familiar and soft',
    moods: ['calm', 'tender', 'bright'],
    notes: [[0, 1, 2], [2, 1, 2], [4, 5, 2], [6, 5, 2], [8, 6, 2], [10, 6, 2]],
  },
  // カノン風: パッヘルベル「カノン」ニ長調の、第1ヴァイオリンが最初に弾く旋律（16音）を6音・6音・4音に分けた3つ。
  // 音高は Wikipedia 掲載の楽譜（LilyPond 原文）で確認。原曲は4拍子の4分音符の連なりで、ここでは1拍に1音（4分音符）に置き直した。
  {
    id: 'canon-a',
    label: 'カノン風（前半）',
    origin: 'パッヘルベル「カノン」の第1ヴァイオリンの旋律の1〜6音目の引用（音高）。リズムは3拍子用に作成',
    hint: 'canon-like steady descent, one note per beat, stately and calm',
    moods: ['calm', 'tender', 'nostalgic'],
    notes: [[0, 10, 2], [2, 9, 2], [4, 8, 2], [6, 7, 2], [8, 6, 2], [10, 5, 2]],
  },
  {
    id: 'canon-b',
    label: 'カノン風（続き）',
    origin: 'パッヘルベル「カノン」の第1ヴァイオリンの旋律の7〜12音目の引用（音高）。リズムは3拍子用に作成',
    hint: 'canon-like line that rises one step and sinks back, even and serene',
    moods: ['calm', 'tender', 'nostalgic', 'bright'],
    notes: [[0, 6, 2], [2, 7, 2], [4, 8, 2], [6, 7, 2], [8, 6, 2], [10, 5, 2]],
  },
  {
    id: 'canon-c',
    label: 'カノン風（結び）',
    origin: 'パッヘルベル「カノン」の第1ヴァイオリンの旋律の13〜16音目の引用（音高）。リズムは3拍子用に作成',
    hint: 'canon-like closing sway, a small swing down and up then a long settled note',
    moods: ['calm', 'tender', 'nostalgic'],
    notes: [[0, 4, 2], [2, 3, 2], [4, 4, 2], [6, 2, 6]],
  },
  // 子犬のワルツ風: ショパン「ワルツ第6番 変ニ長調 作品64-1」の冒頭4小節（右手）を2小節ずつ2つに分けたもの。
  // 音高とリズムは Mutopia 掲載の楽譜（PDF）で確認。度数は変ニ長調の主音（変ニ）を 1 とし、変イ4 = 5。
  // 原曲の「ソ」は ♮（調号の変ト＝4度に対する半音上）だが、断片は全音階の 4（変ト）に平らにしてある。
  {
    id: 'minute-a',
    label: '子犬のワルツ風（冒頭）',
    origin: 'ショパン「子犬のワルツ」（ワルツ第6番 作品64-1）の冒頭2小節の引用（音高・リズム）。原曲の ♮ソ（4度の半音上）は全音階の4に平らにした',
    hint: 'playful whirling eighth notes circling around the fifth, quick and lively like a puppy chasing its tail',
    moods: ['bright', 'tender'],
    notes: [[0, 5, 2], [2, 4, 1], [3, 5, 1], [4, 7, 1], [5, 6, 1], [6, 4, 1], [7, 5, 1], [8, 6, 1], [9, 5, 1], [10, 7, 1], [11, 6, 1]],
  },
  {
    id: 'minute-b',
    label: '子犬のワルツ風（続き）',
    origin: 'ショパン「子犬のワルツ」（ワルツ第6番 作品64-1）の3〜4小節目の引用（音高・リズム）。原曲の ♮ソ（4度の半音上）は全音階の4に平らにした',
    hint: 'continuation of the whirling eighth-note chase, circling back and forth in two-bar waves',
    moods: ['bright', 'tender'],
    notes: [[0, 4, 1], [1, 5, 1], [2, 7, 1], [3, 6, 1], [4, 4, 1], [5, 5, 1], [6, 7, 1], [7, 6, 1], [8, 4, 1], [9, 5, 1], [10, 7, 1], [11, 6, 1]],
  },
  // アラベスク風: 8分音符が蔓のように行きつ戻りつしながら流れる、装飾的な旋律線。
  // 特定の曲の旋律ではなく、19世紀のアラベスク（ブルクミュラー、ドビュッシーなど）に共通する書き方を自作したもの。
  {
    id: 'arabesque-a',
    label: 'アラベスク風（上る蔓）',
    origin: 'アラベスク（装飾的な流れる旋律線）の書き方に着想した自作（出典なし）',
    hint: 'arabesque: winding zigzag eighth notes that climb and then curl down, flowing and ornamental',
    moods: ['bright', 'tender'],
    notes: [[0, 1, 1], [1, 3, 1], [2, 2, 1], [3, 4, 1], [4, 3, 1], [5, 5, 1], [6, 5, 1], [7, 6, 1], [8, 5, 1], [9, 4, 1], [10, 3, 2]],
  },
  {
    id: 'arabesque-b',
    label: 'アラベスク風（回る装飾）',
    origin: 'アラベスクの回音（ターン）の連なりに着想した自作（出典なし）',
    hint: 'arabesque: long note then a small curling turn figure, repeated lower, graceful and delicate',
    moods: ['calm', 'tender', 'nostalgic'],
    notes: [[0, 5, 2], [2, 6, 1], [3, 5, 1], [4, 4, 1], [5, 5, 1], [6, 3, 2], [8, 4, 1], [9, 3, 1], [10, 2, 1], [11, 3, 1]],
  },
  {
    id: 'arabesque-c',
    label: 'アラベスク風（波の下降）',
    origin: 'アラベスクの波打つ下行線に着想した自作（出典なし）',
    hint: 'arabesque: sawtooth waves of eighth notes drifting down, shimmering and light',
    moods: ['bright', 'calm'],
    notes: [[0, 8, 1], [1, 7, 1], [2, 8, 1], [3, 6, 1], [4, 7, 1], [5, 5, 1], [6, 6, 1], [7, 4, 1], [8, 5, 1], [9, 3, 1], [10, 4, 1], [11, 2, 1]],
  },
  {
    id: 'arabesque-d',
    label: 'アラベスク風（収まる曲線）',
    origin: 'アラベスクの、うねってから主音へ落ち着く旋律線に着想した自作（出典なし）',
    hint: 'arabesque: gentle curving line that undulates twice and settles on the home note, soft resolution',
    moods: ['calm', 'tender', 'nostalgic', 'bright'],
    notes: [[0, 3, 1], [1, 4, 1], [2, 3, 1], [3, 2, 1], [4, 3, 2], [6, 5, 1], [7, 4, 1], [8, 3, 1], [9, 2, 1], [10, 1, 2]],
  },
  // 階段の上り下り: 1フレーズ（8小節）を使う長い断片。前半4小節で主音から1オクターブ上まで1段ずつ上り、
  // 後半4小節で1段ずつ下りて主音へ戻る。1小節につき「1歩ずつ2段 + 踊り場の繰り返し」で、1拍目は和音に寄せられる。
  // 8小節目（終止の音）は作らず、生成側が半終止・完全終止の音を置く。音階の上り下りの定型で、特定の曲の旋律ではない。
  {
    id: 'stairs',
    label: '階段の上り下り',
    origin: '音階を1段ずつ上って下りる定型（出典なし）',
    hint: 'whole-phrase staircase: climbs one scale step at a time for four bars, then walks back down for four bars',
    moods: ['bright', 'calm', 'tender'],
    bars: 8,
    notes: [
      [0, 1, 2], [2, 2, 2], [4, 2, 2],
      [6, 3, 2], [8, 4, 2], [10, 4, 2],
      [12, 5, 2], [14, 6, 2], [16, 6, 2],
      [18, 7, 2], [20, 8, 2], [22, 8, 2],
      [24, 7, 2], [26, 6, 2], [28, 6, 2],
      [30, 5, 2], [32, 4, 2], [34, 4, 2],
      [36, 3, 2], [38, 2, 2], [40, 2, 2],
    ],
  },
  // 次の5つは、音の高さを公開されている音名表記（ハ長調）で確認したもの。
  // リズムは表記になかったため、3拍子に合わせて私が決めた（原曲のリズムとは違う）。
  {
    id: 'ieji-a',
    label: '家路風（前半）',
    origin: 'ドヴォルザーク「新世界より」第2楽章の主題（日本の「遠き山に日は落ちて」の旋律）。音高は音名表記で確認、リズムは3拍子用に作成',
    hint: 'gentle pentatonic homeward phrase, warm and nostalgic',
    moods: ['calm', 'tender', 'nostalgic'],
    notes: [[0, 3, 2], [2, 5, 2], [4, 5, 2], [6, 3, 2], [8, 2, 2], [10, 1, 2]],
  },
  {
    id: 'ieji-b',
    label: '家路風（続き）',
    origin: 'ドヴォルザーク「新世界より」第2楽章の主題。音高は音名表記で確認、リズムは3拍子用に作成',
    hint: 'second half of the homeward phrase, rising then settling',
    moods: ['calm', 'tender', 'nostalgic'],
    notes: [[0, 2, 2], [2, 3, 2], [4, 5, 2], [6, 3, 2], [8, 2, 4]],
  },
  {
    id: 'ieji-c',
    label: '家路風（結び）',
    origin: 'ドヴォルザーク「新世界より」第2楽章の主題。音高は音名表記で確認、リズムは3拍子用に作成',
    hint: 'closing phrase of the homeward melody, descending to rest',
    moods: ['calm', 'tender', 'nostalgic'],
    notes: [[0, 2, 2], [2, 3, 2], [4, 2, 2], [6, 1, 4], [10, 1, 2]],
  },
  {
    id: 'grace-a',
    label: '賛美歌風（前半）',
    origin: '賛美歌「アメイジング・グレイス」の冒頭。音高は音名表記（ハ長調）で確認、リズムは3拍子用に作成',
    hint: 'hymn-like opening, calm and uplifting',
    moods: ['calm', 'tender', 'nostalgic'],
    notes: [[0, 8, 4], [4, 10, 2], [6, 8, 4], [10, 10, 2]],
  },
  {
    id: 'grace-b',
    label: '賛美歌風（続き）',
    origin: '賛美歌「アメイジング・グレイス」の冒頭の続き。音高は音名表記（ハ長調）で確認、リズムは3拍子用に作成',
    hint: 'hymn-like continuation, gently falling to a low note',
    moods: ['calm', 'tender', 'nostalgic'],
    notes: [[0, 9, 4], [4, 8, 2], [6, 6, 6]],
  },
].map((m) => ({ ...m, verified: PITCH_VERIFIED_IDS.has(m.id), bars: m.bars ?? 2 }));

// 利用者が作った断片（有効なものだけ）。サーバーと画面で、それぞれ起動時と保存のたびに入れ替える。
let customMotifs = [];

export function setCustomMotifs(list) {
  customMotifs = list.map((m) => ({ ...m }));
}

// 組み込みの断片 + 利用者の断片。選ぶときはこちらを使う（MOTIFS は組み込みだけ）
export function motifPool() {
  return [...MOTIFS, ...customMotifs];
}

export function getMotif(id) {
  const motif = motifPool().find((m) => m.id === id);
  if (!motif) throw new Error(`unknown motif: ${id}`);
  return motif;
}

// 方針を作ったあとに自作の断片が削除された場合でも、再生を止めないための代わり
export function getMotifOr(id, fallbackId = 'lullaby') {
  return motifPool().find((m) => m.id === id) ?? getMotif(fallbackId);
}
