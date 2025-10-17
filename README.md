# 🚀 MindPilot - 智慧任务管理系统

<div align="center">

![MindPilot Logo](./public/images/logo.png)

**🌟 全新一代AI驱动的任务清单与成长辅助系统，重新定义你的每一天！**

[![Next.js](https://img.shields.io/badge/Next.js-15.5.3-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.2-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6.5.0-2D3748?style=for-the-badge&logo=prisma)](https://www.prisma.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.1.13-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)

</div>

---

## 📖 项目简介

**MindPilot** 是一个基于 Next.js 15 和 T3 Stack 构建的现代化任务管理系统，集成了 AI 智能助手、数据分析、用户认证等核心功能。通过 AI 驱动的任务解析和智能分析，帮助用户高效管理任务，提升工作效率。

### 🎯 核心理念

> **"目标一句话，AI帮你拆解成行动！"**

- 🤖 **AI 智能解析** - 自然语言转结构化任务
- 📊 **数据驱动分析** - 深度洞察工作效率
- 🎨 **现代化 UI** - 流畅的交互体验
- 🔒 **安全可靠** - 完整的用户认证体系

---

## ✨ 核心功能

### 🏠 任务详情页面

- **智能任务展示** - 卡片式/列表式双视图
- **实时状态管理** - 待处理/进行中/已完成/暂停/取消
- **优先级系统** - 紧急/高/中/低四级优先级
- **时间管理** - 截止时间、预估时间、开始时间
- **批量操作** - 排序、筛选、刷新、加载更多

![任务详情页面](./public/images/Readme/task-dashboard.png)

### 🤖 智慧助手

- **AI 对话界面** - 基于 DeepSeek 的智能对话
- **任务自动解析** - 从对话中提取结构化任务
- **历史对话管理** - 完整的对话记录和回放
- **手动编辑功能** - 支持任务细节调整
- **批量任务创建** - 一键生成任务清单

![智慧助手页面](./public/images/Readme/ai-assistant.png)

### 📊 任务分析

- **数据统计概览** - 累计任务、连续天数、最佳时段
- **活动热力图** - GitHub 风格的全年度活动可视化
- **24小时分布图** - 工作效率时段分析
- **全球排行榜** - 用户成就对比
- **智能洞察** - 个性化效率建议

![任务分析页面](./public/images/Readme/analysis-dashboard.png)

### ⚙️ 系统设置

- **用户偏好设置** - 个性化配置选项
- **主题切换** - 深色/浅色模式
- **数据管理** - 导出/导入功能
- **账户安全** - 密码修改、登录历史

![设置页面](./public/images/Readme/settings-page.png)

---

## 🛠️ 技术栈

### 前端技术

- **Next.js 15** - React 全栈框架，支持 SSR/SSG
- **TypeScript** - 类型安全的 JavaScript 超集
- **Tailwind CSS** - 原子化 CSS 框架
- **Framer Motion** - 流畅的动画库
- **Radix UI** - 无障碍的组件库
- **React Hook Form** - 表单状态管理
- **Zod** - 运行时类型验证

### 后端技术

- **NextAuth.js v5** - 身份认证解决方案
- **Prisma** - 现代化数据库 ORM
- **MySQL** - 关系型数据库
- **Server Actions** - Next.js 服务端操作

### AI 集成

- **DeepSeek API** - 智能对话和任务解析
- **AI SDK** - 统一的 AI 接口管理

### 开发工具

- **ESLint** - 代码质量检查
- **Prettier** - 代码格式化
- **Turbopack** - 极速构建工具

---

## 🚀 快速开始

### 环境要求

- Node.js 18+
- pnpm 8+
- MySQL 8.0+

### 安装步骤

1. **克隆项目**

```bash
git clone <repository-url>
cd next-t3-app
```

2. **安装依赖**

```bash
pnpm install
```

3. **环境配置**

```bash
# 复制环境变量模板
cp .env.example .env.local

# 配置数据库连接
DATABASE_URL="mysql://root:password@localhost:3306/mindpilot"

# 配置 AI API
DEEPSEEK_API_KEY="your-deepseek-api-key"

# 配置认证密钥
AUTH_SECRET="your-auth-secret"
```

4. **数据库初始化**

```bash
# 推送数据库模式
pnpm db:push

# 生成 Prisma 客户端
pnpm db:generate
```

5. **启动开发服务器**

```bash
pnpm dev
```

访问 [http://localhost:3000](http://localhost:3000) 开始使用！

---

## 📁 项目结构

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # 认证相关页面
│   ├── api/               # API 路由
│   ├── analysis/          # 任务分析页面
│   ├── chat/              # AI 助手页面
│   ├── login/             # 登录页面
│   ├── manual-edit/       # 手动编辑页面
│   ├── settings/          # 设置页面
│   └── page.tsx           # 首页
├── components/            # React 组件
│   ├── ui/               # 基础 UI 组件
│   ├── TaskList.tsx      # 任务列表组件
│   ├── TaskAnalysisPage.tsx # 分析页面组件
│   └── Menu.tsx          # 导航菜单
├── actions/              # Server Actions
│   ├── task.ts           # 任务操作
│   ├── analysis.ts       # 数据分析
│   └── auth.ts           # 认证操作
├── lib/                  # 工具库
│   ├── taskParser.ts     # 任务解析器
│   ├── prisma.ts         # 数据库连接
│   └── utils.ts          # 通用工具
├── schema/               # 数据验证模式
└── types/                # TypeScript 类型定义
```

---

## 🎨 设计亮点

### 响应式设计

- **移动端优先** - 完美适配各种屏幕尺寸
- **自适应布局** - 智能调整界面元素
- **触摸友好** - 优化的移动端交互

### 用户体验

- **流畅动画** - Framer Motion 驱动的微交互
- **即时反馈** - 实时状态更新和错误提示
- **无障碍设计** - 符合 WCAG 标准的可访问性

### 视觉设计

- **现代渐变** - 精心设计的色彩搭配
- **卡片式布局** - 清晰的信息层次
- **图标系统** - Lucide React 图标库

---

## 🔧 核心特性

### AI 任务解析

```typescript
// 智能解析用户输入，生成结构化任务
const tasks = await parseTasksFromAIResponse(aiResponse);
// 输出: [{ content, priority, estimatedHours, ... }]
```

### 实时数据同步

```typescript
// Server Actions 实现实时数据更新
const result = await updateTaskStatus(taskId, newStatus);
// 自动同步到所有客户端
```

### 类型安全

```typescript
// 端到端类型安全
interface Task {
  id: number;
  content: string;
  priority: "low" | "medium" | "high" | "urgent";
  status: "pending" | "in_progress" | "completed" | "paused" | "cancelled";
}
```

---

## 📊 数据模型

### 用户模型

```prisma
model User {
  id            String         @id @default(uuid())
  username      String
  password      String
  avatar        String?
  lists         List[]
  conversations Conversation[]
}
```

### 任务模型

```prisma
model Task {
  id          Int       @id @default(autoincrement())
  content     String
  userId      String
  done        Boolean   @default(false)
  expiresAt   DateTime?
  priority    String    @default("medium")
  status      String    @default("pending")
  startTime   DateTime?
  list        List      @relation(fields: [ListId], references: [id])
}
```

---

## 🚀 部署指南

### Vercel 部署（推荐）

```bash
# 安装 Vercel CLI
npm i -g vercel

# 部署到 Vercel
vercel

# 配置环境变量
vercel env add DATABASE_URL
vercel env add DEEPSEEK_API_KEY
vercel env add AUTH_SECRET
```

### Docker 部署

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

---

## 🤝 贡献指南

我们欢迎所有形式的贡献！

### 开发流程

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

### 代码规范

- 使用 TypeScript 严格模式
- 遵循 ESLint 和 Prettier 配置
- 编写清晰的提交信息
- 添加必要的类型定义

---

## 📝 更新日志

### v1.0.0 (2024-11-16)

- ✨ 初始版本发布
- 🤖 AI 智能助手集成
- 📊 任务分析功能
- 🔐 用户认证系统
- 📱 响应式设计

---

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

---

## 🙏 致谢

感谢以下开源项目的支持：

- [Next.js](https://nextjs.org/) - React 全栈框架
- [Prisma](https://www.prisma.io/) - 数据库 ORM
- [Tailwind CSS](https://tailwindcss.com/) - CSS 框架
- [Framer Motion](https://www.framer.com/motion/) - 动画库
- [Radix UI](https://www.radix-ui.com/) - 组件库

---

## 📞 联系我们

- **项目主页**: [GitHub Repository](https://github.com/your-username/mindpilot)
- **问题反馈**: [Issues](https://github.com/your-username/mindpilot/issues)
- **功能建议**: [Discussions](https://github.com/your-username/mindpilot/discussions)

---

<div align="center">

**🌟 与 MindPilot 一起，飞向更高效的未来！**

Made with ❤️ by LeonGao

</div>
