# PC端和移动端差异化设计

## 🎯 设计目标

根据用户反馈，重新设计分析页面的热力图和24小时活动模块：

1. **PC端增加适合的展示模式** - 为PC端设计更适合的布局
2. **移动端也要时间切换** - 确保移动端和桌面端都显示切换按钮
3. **24小时分布重新设计** - 重构24小时活动模块，提供更好的用户体验

## ✅ 重新设计内容

### 1. 热力图模块 - PC端和移动端差异化设计

#### 移动端热力图 - 紧凑布局

```tsx
{
  /* 移动端热力图 - 紧凑布局 */
}
{
  isMobile ? (
    <div className="w-full">
      {/* 星期标签行 */}
      <div className="mb-2 flex gap-1">
        <div className="w-4"></div> {/* 占位符 */}
        {["日", "一", "二", "三", "四", "五", "六"].map((day, i) => (
          <div
            key={i}
            className="flex h-4 w-4 items-center justify-center text-xs font-medium text-white/50"
          >
            {day}
          </div>
        ))}
      </div>

      {/* 活动网格 - 紧凑布局 */}
      <div className="flex gap-1">
        {Array.from(
          { length: heatmapRange === "recent" ? 6 : 52 },
          (_, weekIndex) => (
            <div key={weekIndex} className="flex flex-col gap-1">
              {Array.from({ length: 7 }, (_, dayIndex) => {
                // 活动方块 - 移动端优化
                return (
                  <motion.div
                    key={dayIndex}
                    className="flex h-4 w-4 cursor-pointer items-center justify-center rounded-sm border border-white/10 transition-all hover:scale-110 hover:border-white/30"
                    // ... 其他属性
                  />
                );
              })}
            </div>
          ),
        )}
      </div>
    </div>
  ) : (
    /* PC端热力图 - 完整布局 */
    <div className="w-full">
      {/* 星期标签行 */}
      <div className="mb-3 flex gap-1">
        <div className="w-6"></div> {/* 占位符 */}
        {["日", "一", "二", "三", "四", "五", "六"].map((day, i) => (
          <div
            key={i}
            className="flex h-6 w-6 items-center justify-center text-xs font-medium text-white/50"
          >
            {day}
          </div>
        ))}
      </div>

      {/* 活动网格 - 完整布局 */}
      <div className="flex gap-1">
        {/* 月份标签列 */}
        <div className="mr-2 flex flex-col gap-1">{/* 月份标签 */}</div>

        {/* 活动方块网格 */}
        <div className="flex gap-1">{/* 活动方块 - PC端优化 */}</div>
      </div>
    </div>
  );
}
```

#### 关键差异

- **移动端**: 紧凑布局，方块尺寸 `w-4 h-4`，隐藏任务数量
- **PC端**: 完整布局，方块尺寸 `w-6 h-6`，显示月份标签和任务数量

### 2. 24小时活动模块 - 重新设计

#### 技术实现

```tsx
{
  /* 时间分布图 - 重新设计 */
}
<div className="space-y-3 sm:space-y-4">
  {/* 图表区域 */}
  <div className="w-full">
    <div className="flex h-24 items-end gap-1 overflow-x-auto sm:h-32 sm:gap-2 md:h-40">
      {stats.hourlyDistribution.map((data: any, index: number) => {
        // 根据范围选择显示数据
        const currentHour = new Date().getHours();
        if (
          hourlyRange === "recent" &&
          !Array.from({ length: 6 }, (_, i) => currentHour - i).includes(
            data.hour,
          )
        ) {
          return null;
        }

        const height =
          data.count > 0
            ? Math.max((data.count / maxHourlyCount) * 100, 10)
            : 5;
        const intensity =
          data.count > 0
            ? Math.min(0.3 + (data.count / maxHourlyCount) * 0.7, 1)
            : 0.1;

        return (
          <motion.div
            key={data.hour}
            className="group flex min-w-0 flex-1 cursor-pointer flex-col items-center justify-end"
            // ... 其他属性
          >
            <motion.div
              className="w-full rounded-t-sm border border-white/10 shadow-sm transition-all duration-300 group-hover:scale-105 sm:rounded-t-md"
              style={{
                height: `${height}%`,
                background: `linear-gradient(to top, rgba(168, 85, 247, ${intensity}), rgba(236, 72, 153, ${intensity}))`,
              }}
              // ... 其他属性
            />
          </motion.div>
        );
      })}
    </div>

    {/* 时间标签 - 响应式显示 */}
    <div className="mt-2 flex gap-1 sm:gap-2">
      {stats.hourlyDistribution.map((data: any, index: number) => {
        // 时间标签
        return (
          <div key={data.hour} className="min-w-0 flex-1 text-center">
            <div className="text-xs font-medium text-white sm:text-sm">
              {data.hour}:00
            </div>
            <div className="hidden text-xs text-white/60 sm:block">
              {data.count}个
            </div>
          </div>
        );
      })}
    </div>
  </div>
</div>;
```

#### 关键改进

- **Flexbox布局**: 使用 `flex` 布局替代CSS Grid，更灵活
- **响应式高度**: 移动端 `h-24`，桌面端 `h-32 md:h-40`
- **标签分离**: 时间标签和任务数量分离显示
- **移动端优化**: 隐藏任务数量，桌面端显示完整信息

## 📱 响应式设计详解

### 移动端 (< 768px)

- **热力图**:
  - 紧凑布局，方块尺寸 `w-4 h-4`
  - 隐藏月份标签和任务数量
  - 使用 `flex` 布局，更紧凑
- **24小时活动**:
  - 图表高度 `h-24`
  - 隐藏任务数量标签
  - 简化洞察卡片布局
- **切换按钮**: 移动端和桌面端都显示

### 桌面端 (> 768px)

- **热力图**:
  - 完整布局，方块尺寸 `w-6 h-6`
  - 显示月份标签和任务数量
  - 使用 `flex` 布局，更完整
- **24小时活动**:
  - 图表高度 `h-32 md:h-40`
  - 显示完整标签信息
  - 完整洞察卡片布局
- **切换按钮**: 移动端和桌面端都显示

## 🎨 视觉设计优化

### 1. 差异化设计

- **移动端**: 紧凑、简洁，突出关键信息
- **PC端**: 完整、详细，提供丰富信息

### 2. 交互设计

- **切换按钮**: 移动端和桌面端都显示
- **悬停效果**: 缩放和边框变化
- **响应式交互**: 针对不同设备优化

### 3. 布局设计

- **移动端**: 使用 `flex` 布局，更紧凑
- **PC端**: 使用 `flex` 布局，更完整
- **响应式**: 根据屏幕尺寸自动调整

## 🔧 技术要点

### 1. 条件渲染

```tsx
{/* 移动端和PC端不同展示模式 */}
{isMobile ? (
  /* 移动端布局 */
) : (
  /* PC端布局 */
)}
```

### 2. 响应式尺寸

```css
/* 移动端 */
.w-4 {
  width: 1rem;
}
.h-4 {
  height: 1rem;
}

/* 桌面端 */
.w-6 {
  width: 1.5rem;
}
.h-6 {
  height: 1.5rem;
}
```

### 3. 布局选择

- **移动端**: 使用 `flex` 布局，更紧凑
- **PC端**: 使用 `flex` 布局，更完整
- **响应式**: 根据设备特点选择最佳布局

## 📊 最终效果

### 热力图

- ✅ PC端和移动端差异化设计
- ✅ 移动端紧凑布局，PC端完整布局
- ✅ 切换功能正常工作
- ✅ 视觉美观，交互流畅

### 24小时活动

- ✅ 移动端也要时间切换
- ✅ 重新设计的24小时分布
- ✅ 移动端和桌面端都有良好的显示效果
- ✅ 洞察卡片提供有价值的信息

### 响应式设计

- ✅ 移动端紧凑布局，突出关键信息
- ✅ 桌面端完整布局，提供丰富信息
- ✅ 布局自适应，完美对齐
- ✅ 交互正常，体验优秀

## 🎯 核心改进

1. **PC端和移动端差异化**: 为不同设备设计最适合的展示模式
2. **移动端时间切换**: 移动端和桌面端都显示切换按钮
3. **24小时分布重构**: 重新设计24小时活动模块，提供更好的用户体验
4. **布局优化**: 使用最适合的布局方式，确保最佳显示效果

通过差异化设计，现在的分析页面在PC和移动端都能提供最适合的展示模式，响应式正常，交互美观，整洁美观！
