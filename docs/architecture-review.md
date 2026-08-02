# NodeCoda 前端架构审查报告

> 审查日期：2026-08-02
> 范围：前端 UI/UX 架构 — 结构 / 布局 / 交互 / UI 系统
> 网站类型：B2B 游乐设备制造商

---

## 评分总览

| 维度 | 评分 | 状态 |
|------|------|------|
| 网站结构 | 5.5/10 | 有改进空间 |
| 布局体系 | 6.5/10 | 基本可用 |
| 交互体验 | 5/10 | 需加强 |
| UI 系统 | 6/10 | 基础扎实 |
| **综合** | **5.75/10** | **需要系统性改进** |

---

## 一、网站结构 (Structure) — 5.5/10

### 1.1 路由架构

```
/[locale]/
├── (shop)/                    # 前台
│   ├── page.tsx               # 首页
│   ├── products/              # 产品列表 + 详情
│   ├── categories/            # 分类页
│   ├── brands/                # 品牌页
│   ├── news/ + [id]/          # 新闻列表 + 详情
│   ├── account/               # 账户中心
│   │   ├── inquiries/         # 询盘历史 (新)
│   │   ├── orders/            # ❌ B2C 残留
│   │   ├── addresses/         # ❌ B2C 残留
│   │   ├── wishlist/          # ❌ B2C 残留
│   │   └── rmas/              # ❌ B2C 残留
│   ├── auth/login             # 登录
│   ├── auth/register          # 注册
│   ├── cart/                  # ❌ B2C 残留（无导航入口但路由存活）
│   └── checkout/              # ❌ B2C 残留
├── admin/                     # 后台管理 (17个子路由)
│   ├── products/ + [id]/ + new/
│   ├── orders/ + [id]/
│   ├── customers/
│   ├── categories/
│   ├── brands/
│   ├── reviews/
│   ├── settings/
│   └── ...
└── payment/                   # 支付页面
```

### 1.2 发现的问题

**🔴 P0 — 信息架构残存 B2C 路线**

- `cart/`、`checkout/`、`account/orders/`、`account/addresses/`、`account/wishlist/`、`account/rmas/` 共 6 个 B2C 路由仍然存活，虽然导航已移除入口但 URL 直接访问仍可打开
- 缺少 B2B 核心页面：`/solutions`（行业解决方案）、`/about`（关于我们）、`/cases`（案例展示）、`/downloads`（技术文档下载）
- 所有 11 语言的 `site.description` 仍写着 "Open-source cross-border e-commerce platform"（跨境电商平台），与 B2B 游乐设备制造商定位不符

**🟡 P1 — 导航与信息架构**

- 导航栏：`nav.orders`、`nav.wishlist`、`nav.cart` 翻译键仍然存在，但 Navbar 已不再引用
- 缺少"询盘历史"的导航入口（需登录后才能看到账户页内的链接）
- 新闻模块没有分类/标签体系，所有新闻混在一起
- 品牌页功能单一，只展示品牌名列表，无品牌故事/产品线

**🟢 P2 — 细节**

- `nav.about` 翻译键存在但无对应路由页面
- 无 sitemap / 面包屑导航在部分页面缺失
- 新闻详情页路由在 `news/[id]` 而非 `news/[slug]`，不利于 SEO

### 1.3 改进建议

1. **删除或隐藏 B2C 路由**：`cart/`、`checkout/` 重定向到首页；`account/orders/` → 重定向到 `account/inquiries/`
2. **新增 B2B 核心页面**：`/solutions`（行业解决方案，如"主题乐园/景区/商业综合体"）、`/about`（公司介绍+工厂实拍+资质）、`/cases`（项目案例展示）
3. **更新所有语言文件**的 `site.description` 和 `site.title` 为 B2B 游乐设备制造商定位
4. **新闻模块增加分类**（公司新闻、行业动态、产品发布）
5. **导航增加"解决方案"**和"案例"入口

---

## 二、布局体系 (Layout) — 6.5/10

### 2.1 当前布局模式

| 页面 | 布局模式 | 最大宽度 | 响应式 |
|------|---------|---------|--------|
| 首页 | 全幅区块式 | max-w-7xl | ✅ 3断点 |
| 产品列表 | 左侧筛选+右侧网格 | max-w-7xl | ✅ 4断点 |
| 产品详情 | 左图右信息 | max-w-7xl | ✅ 3断点 |
| 分类页 | 网格卡片 | max-w-7xl | ✅ 4断点 |
| 品牌页 | 网格卡片 | max-w-7xl | ✅ 4断点 |
| 新闻页 | 网格卡片 | max-w-7xl | ✅ 3断点 |
| 账户页 | 左侧边栏+右侧内容 | max-w-7xl | ✅ 3断点 |
| 管理员 | 左侧边栏+右侧内容 | 满宽 | ✅ 响应式侧栏 |

### 2.2 发现的问题

**🟡 P1 — 布局一致性问题**

- **重复样板代码**：每个页面都重复写 `min-h-screen bg-gray-50` + `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8`，没有抽取为布局组件
- **页面标题不一致**：有的页面用 `text-2xl font-bold`，有的用 `text-3xl`，有的用 `text-xl`
- **加载状态不一致**：有的用 `animate-pulse` 骨架屏，有的用 `loading` 文字，有的无加载态
- **空状态处理缺失**：品牌页、分类页、新闻页等没有空状态展示

**🟢 P2 — 细节**

- 品牌页卡片 `min-h-screen bg-gray-50` 导致页面高度始终为 100vh
- 移动端底部间距不一致（有的页面有 `pb-16` 有的没有）
- 管理员页面固定侧边栏在移动端占位过大

### 2.3 改进建议

1. **抽取 `PageLayout` 组件**：统一管理 `max-w-7xl mx-auto px-4...` 样板代码
2. **抽取 `PageHeader` 组件**：统一页面标题 + 副标题样式
3. **抽取 `SkeletonGrid` 组件**：统一骨架屏加载状态
4. **统一空状态组件**：比如 `EmptyState` 组件带图标+文案+CTA

---

## 三、交互体验 (Interaction) — 5/10

### 3.1 当前交互模式

| 交互类型 | 实现方式 | 覆盖范围 |
|---------|---------|---------|
| 卡片 hover | 阴影提升 + 微抬升 | 产品卡片、分类卡片 |
| 按钮 hover | 颜色变化/透明度 | 全站 |
| 导航 hover | 颜色变化 | 导航栏 |
| 产品浮层 | hover 技术参数滑入 | 产品列表页 |
| 无限滚动 | CSS 动画 + 悬停暂停 | 合作伙伴 Logo 墙 |
| 弹窗 | Dialog 组件 | 询盘表单 |
| 骨架屏 | animate-pulse | 部分页面 |
| 面包屑 | Breadcrumb 组件 | 部分页面 |
| 通知 | Sonner toast | 询盘提交成功 |

### 3.2 发现的问题

**🔴 P0 — 反馈机制缺失**

- **无全局加载指示器**：页面切换/数据加载没有顶部进度条
- **表单提交无加载状态**：注册/登录表单提交时按钮无 loading 状态
- **错误处理不一致**：有的页面用 `error` 状态显示，有的 `console.error` 静默失败，有的直接用 `catch` 忽略

**🟡 P1 — 交互深度不足**

- **无滚动动画**：首页区块没有滚动触发入场动画（除了产品区的 fadeInUp）
- **无微交互**：按钮点击无波纹/反馈，链接无下划线动画
- **无图片懒加载**：虽然有 `next/image` 但没有 `loading="lazy"` 属性
- **无滚动到顶部**：长页面没有回到顶部按钮
- **无键盘导航增强**：产品列表不支持键盘上下选择

**🟢 P2 — 细节**

- 首页产品区 hover 浮层在半透明背景上文字可读性一般
- 分类页面卡片点击区域只有文字，没有整张卡片可点击
- 品牌页品牌名可点击但无 hover 反馈
- 询盘表单提交后无关闭弹窗的自动倒计时

### 3.3 改进建议

1. **添加 NProgress 页面加载进度条**（可使用 `next/navigation` 的 `useNavigation` 监听）
2. **统一按钮 loading 状态**：所有表单提交按钮添加 `loading` prop
3. **添加滚动触发动画**：首页各区块使用 `IntersectionObserver` 实现 fadeInUp
4. **添加微交互**：按钮点击波纹效果、卡片 hover 更丰富的反馈
5. **添加「回到顶部」按钮**：页面滚动超过 300px 后显示
6. **统一错误处理**：全局错误边界 + 每个页面兜底错误 UI

---

## 四、UI 系统 (UI System) — 6/10

### 4.1 当前组件库

| 类别 | 可用组件数 | 实际使用数 | 使用率 |
|------|-----------|-----------|--------|
| shadcn/ui | 53 | ~20 | 38% |
| 自定义组件 | — | 5 | — |

**实际使用的 shadcn 组件**：Button, Card, Badge, Input, Select, Tabs, Dialog, DialogContent, Skeleton, Table, Breadcrumb, Separator, Sonner, Label, Textarea

**自有组件**：Navbar, Footer, InquiryModal, ProductReviews, Breadcrumb

### 4.2 发现的问题

**🟡 P1 — 设计系统不完整**

- **CSS 变量不足**：`globals.css` 中只定义了少量 CSS 变量，没有形成完整的 token 体系
- **颜色使用不统一**：同一种灰色在不同页面使用 `gray-50`、`gray-100`、`slate-50` 混用
- **圆角风格不一致**：有的用 `rounded-xl`，有的 `rounded-lg`，有的 `rounded-2xl`
- **阴影层级不统一**：`shadow-sm`、`shadow-md`、`shadow-lg` 在不同场景混用，没有层级规范

**🟡 P1 — 设计系统与实现在 DESIGN.md 之间脱节**

- `DESIGN.md` 定义了蓝色主色 `#2563eb`，但代码中大量使用 `#4F46E5`（indigo-600）等相近但不是同一颜色的值
- `DESIGN.md` 定义了 `from-blue-900 via-blue-700 to-indigo-900` 的 Hero 渐变，但实际代码中部分使用了不同的渐变
- 没有统一的 spacing scale 规范（有的用 `gap-6`，有的 `gap-8`，有的 `space-y-6`）

**🟢 P2 — 组件复用度低**

- 产品卡片在列表页和首页各实现一次，未抽取为共享组件
- 分类卡片同样在首页和分类页各实现一次
- 骨架屏样式在各页面重复定义
- 页面加载/错误/空状态在每个页面重复实现

### 4.3 改进建议

1. **建立完整 Design Token 体系**：在 `globals.css` 中定义所有颜色、间距、圆角、阴影的 CSS 变量
2. **抽取共享组件**：`ProductCard`、`CategoryCard`、`NewsCard`、`PageSkeleton`、`EmptyState`、`ErrorState`
3. **统一组件样式规范**：所有卡片使用相同的圆角/阴影/间距配置
4. **建立组件故事/文档**：用 `@/components/ui/` 下的组件作为基础，自有组件作为复合组件

---

## 五、改进优先级路线图

### 立即 (P0)
| 项 | 工作量 | 影响 |
|----|--------|------|
| 更新所有语言 site.description 为 B2B 定位 | 小 | 高 |
| 删除/重定向 B2C 路由 (cart/checkout/orders/addresses/wishlist/rmas) | 中 | 高 |
| 统一错误处理 + 全局加载状态 | 中 | 高 |

### 短期 (P1)
| 项 | 工作量 | 影响 |
|----|--------|------|
| 抽取 PageLayout + PageHeader + SkeletonGrid 组件 | 小 | 高 |
| 建立完整 CSS 变量体系 | 中 | 高 |
| 新增 B2B 核心页面（About / Solutions / Cases） | 大 | 高 |
| 抽取共享组件 (ProductCard/CategoryCard) | 中 | 中 |
| 添加滚动触发动画 | 中 | 中 |
| 统一颜色/圆角/阴影使用规范 | 中 | 中 |

### 中期 (P2)
| 项 | 工作量 | 影响 |
|----|--------|------|
| 新闻模块增加分类标签 | 中 | 中 |
| 品牌页升级（品牌故事/产品线） | 中 | 中 |
| 添加微交互（点击波纹、hover 动效） | 中 | 低 |
| 键盘导航增强 | 小 | 低 |
| 添加回到顶部按钮 | 小 | 低 |

---

## 六、总结

NodeCoda 前端在从 B2C 电商向 B2B 工业设备网站转型的过程中已完成了**核心功能改造**（询盘系统、导航栏、首页内容），但**信息架构和 UI 基础设施建设**还存在较明显的 B2C 历史包袱。

**核心问题**：这是一个"披着 B2B 外衣的 B2C 电商系统"——首页内容已改，但底层路由、语言文件、账户体系仍保留大量电商痕迹。

**改进方向**：紧抓"B2B 工业设备制造商"这一核心定位，从上到下做一次彻底的骨架清理，先切除残留 B2C 器官，再建立统一的 B2B UI 基础设施。