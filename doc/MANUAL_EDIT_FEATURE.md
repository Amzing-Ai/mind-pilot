# 手动修改清单功能总结

## 🎯 功能目标

1. 创建手动修改清单页面，支持编辑任务详情
2. 实现状态保存和回显功能
3. 提供返回和创建清单按钮
4. 优化交互、样式和响应式设计
5. 创建成功后跳转到首页

## ✨ 主要功能

### 1. 手动修改页面 (`/manual-edit`)

**页面特点**：

- 完整的任务编辑界面
- 支持编辑任务内容、优先级、时间
- 添加/删除任务功能
- 实时计算截止时间

**核心功能**：

- **任务编辑**：可编辑任务内容、优先级、预估时间
- **动态计算**：根据预估时间自动计算截止时间
- **任务管理**：支持添加新任务和删除现有任务
- **状态保存**：使用sessionStorage保存编辑状态

### 2. 状态管理

**数据流转**：

1. 聊天页面解析AI回复生成任务
2. 点击"手动修改任务"保存数据到sessionStorage
3. 跳转到手动修改页面
4. 页面加载时从sessionStorage读取数据
5. 编辑完成后创建清单并跳转到首页

**数据结构**：

```typescript
interface EditableTask {
  id: string;
  content: string;
  priority: "low" | "medium" | "high" | "urgent";
  estimatedHours?: number;
  startTime?: Date;
  expiresAt?: Date;
  status: "pending" | "in_progress" | "completed" | "paused" | "cancelled";
}
```

### 3. 交互设计

**页面布局**：

- **Header**：返回按钮、页面标题、创建清单按钮
- **清单名称**：可编辑的清单名称输入框
- **任务列表**：每个任务的编辑卡片
- **添加任务**：底部添加新任务按钮

**交互效果**：

- 动画过渡效果
- 悬停和点击反馈
- 加载状态指示
- 错误处理和提示

## 🔧 技术实现

### 1. 页面路由

```tsx
// 手动修改页面
src / app / manual - edit / page.tsx;

// 聊天页面集成
src / app / chat / page.tsx;
```

### 2. 状态保存和回显

```tsx
// 保存数据到sessionStorage
const handleManualEdit = () => {
  const editableTasks = parsedTasks.map((task, index) => ({
    id: `task-${index}`,
    content: task.content,
    priority: task.priority,
    estimatedHours: task.estimatedHours,
    startTime: task.startTime,
    expiresAt: task.expiresAt,
    status: task.status,
  }));

  sessionStorage.setItem("manualEditTasks", JSON.stringify(editableTasks));
  sessionStorage.setItem(
    "manualEditListName",
    extractedListName || "AI生成任务",
  );

  router.push("/manual-edit");
};

// 从sessionStorage读取数据
useEffect(() => {
  const savedTasks = sessionStorage.getItem("manualEditTasks");
  const savedListName = sessionStorage.getItem("manualEditListName");

  if (savedTasks) {
    const parsedTasks = JSON.parse(savedTasks);
    setTasks(parsedTasks);
  }

  if (savedListName) {
    setListName(savedListName);
  }
}, []);
```

### 3. 任务编辑功能

```tsx
// 更新任务
const updateTask = (id: string, field: keyof EditableTask, value: any) => {
  setTasks((prev) =>
    prev.map((task) => (task.id === id ? { ...task, [field]: value } : task)),
  );
};

// 添加任务
const addTask = () => {
  const newTask: EditableTask = {
    id: Date.now().toString(),
    content: "",
    priority: "medium",
    estimatedHours: 1,
    startTime: new Date(),
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    status: "pending",
  };
  setTasks((prev) => [...prev, newTask]);
};

// 删除任务
const deleteTask = (id: string) => {
  setTasks((prev) => prev.filter((task) => task.id !== id));
};
```

### 4. 时间计算

```tsx
// 计算截止时间
const calculateExpiresAt = (estimatedHours: number) => {
  const now = new Date();
  return new Date(now.getTime() + estimatedHours * 60 * 60 * 1000);
};

// 处理时间变化
const handleTimeChange = (id: string, hours: number) => {
  updateTask(id, "estimatedHours", hours);
  updateTask(id, "expiresAt", calculateExpiresAt(hours));
};
```

## 📱 用户体验设计

### 1. 响应式布局

**桌面端**：

- 两列布局（任务内容 + 优先级/时间）
- 大屏幕优化显示
- 悬停效果和动画

**移动端**：

- 单列布局
- 触摸友好的按钮大小
- 适配小屏幕显示

### 2. 交互反馈

**视觉反馈**：

- 按钮悬停和点击动画
- 加载状态指示器
- 成功/错误提示

**操作反馈**：

- 实时保存状态
- 即时验证输入
- 清晰的操作结果

### 3. 错误处理

**数据验证**：

- 检查任务内容是否为空
- 验证时间输入格式
- 确保至少有一个任务

**用户提示**：

- 清晰的错误消息
- 操作指导
- 状态反馈

## 🎨 样式设计

### 1. 视觉层次

**颜色方案**：

- 主色调：渐变蓝紫色背景
- 卡片：半透明白色背景
- 按钮：渐变色彩搭配
- 文字：白色和半透明白色

**布局结构**：

- 清晰的页面分区
- 合理的间距设计
- 统一的圆角和阴影

### 2. 动画效果

**页面动画**：

- 入场动画（fade in + slide up）
- 任务卡片依次出现
- 按钮交互动画

**微交互**：

- 悬停缩放效果
- 点击反馈动画
- 加载状态动画

## 🚀 功能流程

### 1. 完整流程

1. **AI生成任务** → 聊天页面解析任务
2. **点击手动修改** → 保存数据到sessionStorage
3. **跳转编辑页面** → 加载保存的数据
4. **编辑任务详情** → 实时更新任务信息
5. **创建清单** → 调用API创建任务
6. **成功提示** → 跳转到首页
7. **清理数据** → 清除sessionStorage

### 2. 错误处理流程

1. **数据丢失** → 提示重新生成任务
2. **创建失败** → 显示错误信息
3. **网络错误** → 重试机制
4. **验证失败** → 字段级错误提示

## 🔮 未来扩展

- 任务模板保存和加载
- 批量操作功能
- 任务依赖关系设置
- 高级时间管理功能
- 任务分类和标签

---

**开发完成时间**：2025-01-11
**功能版本**：v1.0
**测试状态**：✅ 通过
