# DESIGN.md — NodeCoda

## 设计风格

**干净、明亮、愉悦** — 蓝色为主，白色为底，简洁通透。

## 色彩系统
- **主色**：蓝色 `#2563eb` (blue-600) — 专业信赖感
- **背景**：纯白 `#FFFFFF` + 浅灰 `#F9FAFB` (gray-50) 分段
- **文字**：深灰 `#111827` (gray-900) + 辅助 `#6B7280` (gray-500)
- **CTA**：白色按钮 + 蓝色文字，或蓝色按钮 + 白色文字
- **强调色**：橙色 `#F97316` (orange-500) — 购物车 Badge、导航 hover 态
- **Hero**：渐变 `from-blue-900 via-blue-700 to-indigo-900`

## 字体
- 系统字体栈：`PingFang SC / Hiragino Sans GB / Microsoft YaHei / system-ui`

## 布局
- 最大宽度 `max-w-7xl` (1280px)
- Hero 全幅 → 数据统计 → 产品展示 → 品牌 → 特性 → 新闻
- 卡片无边框，圆角，hover 阴影提升

## 交互
- 链接 hover 蓝色，导航 hover 橙色
- 卡片 hover 阴影 + 微抬升
- 产品区 fadeInUp 入场动画