# 任务生成优化总结

## 🎯 优化目标

1. 添加任务生成模式选择（详细 vs 简洁）
2. 每次创建任务都生成新的清单
3. 修改按钮文字为"手动修改任务"
4. 以目标分析为清单名称

## ✨ 主要改进

### 1. 任务生成模式选择

- **详细模式**：生成更多更细致的任务，将目标拆解为具体的执行步骤
- **简洁模式**：生成更少更关键的任务，专注于核心要点
- **用户选择**：在输入框上方添加切换按钮，用户可以选择生成模式
- **智能提示**：根据选择的模式自动添加相应的提示词

### 2. 清单管理优化

- **自动创建新清单**：每次点击创建任务都会生成新的清单
- **目标分析命名**：使用AI回复中的目标分析作为清单名称
- **独立管理**：每个任务生成会话都有独立的清单，便于管理

### 3. 用户体验优化

- **按钮文字更新**：将"稍后处理"改为"手动修改任务"
- **模式切换**：直观的切换按钮，支持实时切换
- **视觉反馈**：选中状态的视觉指示

## 🔧 技术实现

### 任务生成模式选择

```tsx
const [taskGenerationMode, setTaskGenerationMode] = useState<
  "detailed" | "concise"
>("detailed");

const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();
  if (input.trim()) {
    // 根据任务生成模式添加提示词
    const modePrompt =
      taskGenerationMode === "detailed"
        ? "请生成更多更细致的任务，将目标拆解为具体的执行步骤。"
        : "请生成更少更关键的任务，专注于核心要点。";

    const enhancedInput = `${input}\n\n${modePrompt}`;
    void sendMessage({ text: enhancedInput });
    setInput("");
  }
};
```

### 模式选择UI

```tsx
{
  /* 任务生成模式选择 */
}
<div className="mb-4 flex justify-center">
  <div className="flex rounded-xl bg-white/10 p-1 backdrop-blur">
    <button
      type="button"
      onClick={() => setTaskGenerationMode("detailed")}
      className={`rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 ${
        taskGenerationMode === "detailed"
          ? "bg-white/20 text-white shadow-lg"
          : "text-white/70 hover:bg-white/10 hover:text-white"
      }`}
    >
      生成更多更细致的任务
    </button>
    <button
      type="button"
      onClick={() => setTaskGenerationMode("concise")}
      className={`rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 ${
        taskGenerationMode === "concise"
          ? "bg-white/20 text-white shadow-lg"
          : "text-white/70 hover:bg-white/10 hover:text-white"
      }`}
    >
      生成更少更关键的任务
    </button>
  </div>
</div>;
```

### 清单创建逻辑

```tsx
const handleCreateTasks = async () => {
  // 总是创建新的清单
  const result = await createListAndTasks({
    listName: extractedListName || "AI生成任务",
    listColor: "#3B82F6",
    tasks: parsedTasks,
  });

  if (result.success) {
    toast.success(
      `成功创建清单"${extractedListName}"和${result.taskCount}个任务！`,
    );
    setShowModal(false);
    setParsedTasks([]);
    setExtractedListName("");
  }
};
```

## 📱 用户界面

### 模式选择按钮

- **位置**：输入框上方居中
- **样式**：毛玻璃效果，圆角设计
- **交互**：点击切换，选中状态高亮
- **响应式**：适配移动端和桌面端

### 按钮文字更新

- **原文字**：稍后处理
- **新文字**：手动修改任务
- **图标**：保持Edit3图标
- **功能**：关闭模态框，允许用户手动编辑

## 🚀 用户体验提升

1. **灵活选择**：用户可以根据需求选择任务生成模式
2. **独立清单**：每次生成都有独立的清单，便于管理
3. **清晰命名**：使用目标分析作为清单名称，更加直观
4. **操作明确**：按钮文字更加明确，用户知道点击后的效果

## 📊 功能特点

- **智能提示**：根据模式自动添加相应的AI提示词
- **状态管理**：模式选择状态持久化
- **视觉反馈**：选中状态的清晰指示
- **无缝切换**：支持实时切换模式

## 🔮 未来扩展

- 支持更多生成模式（如按优先级、按时间等）
- 模式历史记录
- 个性化模式推荐
- 批量模式切换

---

**优化完成时间**：2025-01-11
**优化版本**：v1.0
**测试状态**：✅ 通过
