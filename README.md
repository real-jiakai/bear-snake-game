# PDF贪吃熊游戏 (Bear Snake Game in PDF)

这是一个使用前端技术实现的PDF贪吃熊游戏。游戏是经典贪吃蛇的变种，以熊为主题，可以直接在PDF文件中运行。

## 项目结构

```
/
├── index.html              # 主页面，包含游戏预览和PDF生成功能
├── src/
│   ├── css/
│   │   └── style.css       # 样式表
│   └── js/
│       ├── bear_snake.js   # 贪吃熊游戏逻辑
│       └── pdf-generator.js# PDF生成器
└── README.md               # 项目说明
```

## 功能特点

- 网页版预览：可以直接在网页中试玩贪吃熊游戏
- PDF生成：点击按钮可生成包含游戏的PDF文件
- 响应式设计：适配不同设备尺寸
- 可爱的熊主题：替代传统贪吃蛇的外观
- 特殊食物系统：普通食物和金色奖励食物

## 使用方法

1. 打开`index.html`文件
2. 在网页中试玩贪吃熊游戏
3. 点击"生成贪吃熊PDF"按钮
4. 下载生成的PDF文件
5. 使用Adobe Acrobat Reader打开PDF文件进行游戏
   - 确保在Acrobat Reader中启用了JavaScript功能

## 游戏控制

- 箭头键或WASD键控制方向
- 屏幕上的方向按钮也可用于控制
- 收集红色食物增加分数和长度
- 金色奖励食物提供额外分数

## 技术实现

本项目使用以下技术：

- HTML5 Canvas：用于游戏图形渲染
- JavaScript：游戏逻辑和交互
- CSS3：样式和响应式设计
- jsPDF：生成包含JavaScript的PDF文件

PDF版本使用Adobe Acrobat JavaScript API，能够在Adobe Acrobat Reader中运行游戏。

## 注意事项

- 游戏仅在Adobe Acrobat Reader中有效，其他PDF查看器不支持
- 必须在Acrobat Reader中启用JavaScript功能
- 某些安全设置可能会阻止游戏运行

## 许可

此项目使用MIT许可证。

## 致谢

- 感谢Claude AI的协助(Claude Code)
- 灵感来源于经典贪吃蛇游戏和其他PDF游戏实现