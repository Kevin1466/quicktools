# 百宝箱 - 在线实用工具聚合平台

一个功能丰富的在线工具箱平台，使用 React 19 + TypeScript + Tailwind CSS + shadcn/ui 技术栈开发。

## 功能特性

- 🎨 **精美的UI设计**：采用现代化设计风格，响应式布局适配各种设备
- 🔍 **智能搜索**：支持按工具名称快速搜索
- 📁 **分类导航**：清晰的分类结构，便于快速找到所需工具
- 🛠️ **丰富的工具**：包含图片处理、PDF转换、OCR识别、生活娱乐等多种工具
- 📊 **数据统计**：记录工具使用次数，提供使用分析
- 🌐 **SEO优化**：完善的meta标签，便于搜索引擎收录

## 技术栈

- **前端框架**：React 19 + TypeScript
- **构建工具**：Vite 6
- **路由**：React Router v7
- **样式方案**：Tailwind CSS 4
- **组件库**：shadcn/ui
- **图标**：Lucide React

## 项目结构

```
/quick_tools
├── public/                    # 静态资源
│   ├── favicon.ico
│   └── assets/
├── src/
│   ├── components/            # 公共组件
│   │   ├── layout/           # 布局组件
│   │   ├── ui/               # shadcn/ui基础组件
│   │   ├── common/           # 业务公共组件
│   │   └── features/         # 功能组件
│   ├── pages/                 # 页面级组件
│   │   ├── home/            # 首页
│   │   ├── category/        # 分类页面
│   │   ├── search/          # 搜索结果页
│   │   └── tools/           # 工具页面
│   ├── data/                  # 数据文件
│   ├── hooks/                 # 自定义Hooks
│   ├── utils/                 # 工具函数
│   ├── types/                 # TypeScript类型定义
│   ├── contexts/              # React Context
│   ├── services/              # 服务层
│   └── lib/                   # 第三方库封装
├── index.html
├── vite.config.ts
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

## 安装与运行

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

访问 http://localhost:3000 查看应用

### 构建生产版本

```bash
npm run build
```

### 预览生产版本

```bash
npm run preview
```

## 工具分类

- **图片工具**：图片压缩、证件照生成、图片转PDF等
- **PDF工具**：PDF转Word、PDF转Excel、PDF压缩、PDF加水印等
- **文档工具**：Word转PDF、Excel转PDF、PPT转PDF等
- **识别工具**：身份证识别、银行卡识别、印刷体识别、手写体识别等
- **生活娱乐**：垃圾分类查询、今天吃什么等
- **教育工具**：字帖生成等
- **开发工具**：密码安全检测等
- **AI特色工具**：AI诗词配图、AI智能抠图、AI代码解释等

## 开发计划

### 第一阶段：基础框架（Day 1）
- 初始化项目
- 搭建Layout组件
- 实现路由系统
- 创建工具数据文件
- 实现首页和分类筛选
- 实现搜索功能
- 添加全局埋点系统

### 第二阶段：P0核心工具（Day 2-3）
- 图片压缩
- PDF转Word
- PDF转Excel
- Word转PDF
- 垃圾分类查询
- 今天吃什么

### 第三阶段：P1重要工具（Day 4-5）
- 证件照生成
- PDF压缩
- PDF加水印
- 身份证识别
- 银行卡识别
- 印刷体识别
- Excel转PDF
- PPT转PDF
- 字帖生成

### 第四阶段：P2进阶工具+AI特色（Day 6-7）
- 手写体识别
- PDF拆分
- PDF合并
- 图片转PDF
- 密码安全检测
- AI诗词配图（UI+Mock）
- AI智能抠图（UI+Mock）
- AI代码解释（UI+Mock）

### 第五阶段：优化与上线（Day 8-10）
- 响应式适配
- 加载状态和空状态优化
- SEO优化
- 性能优化
- 部署到Vercel
- 域名配置

## 许可证

MIT License
