**目次：**

- [中国語](README.md)
- [英語](README.en.md)
- [日本語](README.ja.md)

# Fifteen-Day Frontline

ブラウザで動作する 3D/WebGL 大マップ戦場サバイバルシューターのプロトタイプ。

![Fifteen-Day Frontline メインメニュー](./docs/screenshot.png)

## オンラインで遊ぶ

GitHub Pages へのデプロイ後、以下にアクセスしてください：

https://keng0nion.github.io/fifteen-day-frontline/

## ゲーム内容

- Three.js/WebGL による 3D 戦場
- 大マップの昼夜サイクルと天候
- 複数の勢力と小隊レベルの戦術AI
- 銃声の調査、側面攻撃（フランキング）、制圧、エアドロップの争奪
- 狩猟による食料の入手
- ステータス効果：空腹度、体力、出血、骨折、感染、制圧など
- 医療ルール：包帯は止血のみ、副木は骨折の治療のみ、抗生物質は感染の治療のみ、レーションは空腹度の回復のみ、体力を回復できるのは輸血キットのみ
- 死亡するとメインメニューに直接戻ります
- 15日間生き延びるか、システムミッションを5つ完了するとエンディングに到達します

## ローカルで実行

`index.html` を直接開けば遊べます。任意の静的サーバーでディレクトリ全体をホストすることもできます。

主なファイル：

- `index.html`
- `styles.css`
- `src/game.js`
- `vendor/three.min.js`
- `vendor/GLTFLoader.js`

## 操作方法

- `WASD` 移動
- `Shift` ダッシュ
- 左クリック / Space で射撃
- 右クリック / Q でエイム
- `R` リロード
- `E` 調査/インタラクト
- `1-8` 武器の切り替え
- `Z/X/C/V/B/G` 医療品・食料・弾薬の使用
