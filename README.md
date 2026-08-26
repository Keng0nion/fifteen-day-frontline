# 十五日战线

网页端 3D/WebGL 大地图战场生存射击原型。

## 在线游玩

GitHub Pages 部署后访问：

https://keng0nion.github.io/fifteen-day-frontline/

## 游戏内容

- Three.js/WebGL 3D 战场
- 大地图昼夜交替与天气
- 多阵营、多小队战术 AI
- 枪声调查、包抄、压制、抢空投
- 狩猎获取食物
- 饥饿、血条、流血、骨折、感染、压制等状态
- 医疗规则：绷带只止血，夹板只治骨折，抗生素只治感染，口粮只恢复饥饿，只有输血包回血
- 死亡直接回主界面
- 生存 15 天或完成 5 个系统任务达成结局

## 本地运行

直接打开 `index.html` 即可游玩；也可以用任意静态服务器托管整个目录。

主要文件：

- `index.html`
- `styles.css`
- `src/game.js`
- `vendor/three.min.js`
- `vendor/GLTFLoader.js`

## 操作

- `WASD` 移动
- `Shift` 冲刺
- 左键/空格射击
- 右键/Q 精瞄
- `R` 换弹
- `E` 搜索/交互
- `1-8` 切换武器
- `Z/X/C/V/B/G` 使用医疗、食物和弹药物资
