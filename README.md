**目录：**

- [中文版](README.md)
- [英文版](README.en.md)
- [日文版](README.ja.md)

# Fifteen-Day Frontline

一个基于浏览器的 3D/WebGL 大地图战场生存射击原型。

![Fifteen-Day Frontline main menu](./docs/screenshot.png)

## 在线游玩

GitHub Pages 部署完成后，访问：

https://keng0nion.github.io/fifteen-day-frontline/

## 游戏内容

- Three.js/WebGL 3D 战场
- 大地图昼夜循环与天气
- 多个阵营与班级战术AI
- 枪声调查、包抄、压制、争夺空投
- 狩猎获取食物
- 状态效果：饥饿值、生命值、流血、骨折、感染、压制等
- 医疗规则：绷带只能止血，夹板只能治疗骨折，抗生素只能治疗感染，口粮只能恢复饥饿值，只有输血包能恢复生命值
- 死亡后直接返回主菜单
- 存活 15 天或完成 5 个系统任务即可达成结局

## 本地运行

直接打开 `index.html` 即可游玩；也可以用任意静态服务器托管整个目录。

主要文件：

- `index.html`
- `styles.css`
- `src/game.js`
- `vendor/three.min.js`
- `vendor/GLTFLoader.js`

## 操作说明

- `WASD` 移动
- `Shift` 冲刺
- 鼠标左键 / Space 射击
- 鼠标右键 / Q 瞄准
- `R` 换弹
- `E` 搜索/交互
- `1-8` 切换武器
- `Z/X/C/V/B/G` 使用医疗、食物和弹药补给
