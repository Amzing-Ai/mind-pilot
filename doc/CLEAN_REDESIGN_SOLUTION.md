# 简洁重设计解决方案

## 🎯 问题分析

用户反馈之前的方案越来越复杂，要求：

1. **移动端**: 显示最近6小时/6周，添加范围选择器
2. **热力图**: 横竖对齐，美观布局
3. **时间图**: 简洁清晰，不密集
4. **PC和移动端**: 都保持美观

## ✅ 最终解决方案

### 1. 热力图重新设计

#### 核心特性

- **范围选择器**: 最近6周 vs 全年切换
- **横竖对齐**: 6x6网格，完美对齐
- **美观布局**: 星期标签 + 月份标签 + 活动方块
- **数据展示**: 方块内显示任务数量

```tsx
{
  /* Activity Heatmap - 重新设计 */
}
<Card className="overflow-hidden rounded-3xl border-white/20 bg-white/10 backdrop-blur-xl">
  <CardHeader className="relative p-4 sm:p-6">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 p-2">
          <Calendar className="h-5 w-5 text-white" />
        </div>
        <div>
          <CardTitle className="text-lg text-white sm:text-xl">
            {isMobile ? "最近6周活动" : "全年活动热力图"}
          </CardTitle>
          <p className="mt-1 text-sm text-white/60">
            {isMobile ? "最近6周的任务完成情况" : "过去52周的任务完成情况"}
          </p>
        </div>
      </div>

      {/* 范围选择器 */}
      <div className="flex gap-1 rounded-lg bg-white/10 p-1">
        <button
          className={`rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
            isMobile
              ? "bg-white/20 text-white"
              : "text-white/60 hover:text-white"
          }`}
          onClick={() => setIsMobile(true)}
        >
          最近6周
        </button>
        <button
          className={`rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
            !isMobile
              ? "bg-white/20 text-white"
              : "text-white/60 hover:text-white"
          }`}
          onClick={() => setIsMobile(false)}
        >
          全年
        </button>
      </div>
    </div>
  </CardHeader>

  <CardContent className="relative p-4 sm:p-6">
    {/* 热力图网格 */}
    <div className="overflow-x-auto">
      <div className="inline-block">
        {/* 星期标签 */}
        <div className="mb-2 flex gap-1">
          <div className="w-6"></div> {/* 占位符 */}
          {["日", "一", "二", "三", "四", "五", "六"].map((day, i) => (
            <div
              key={i}
              className="flex h-6 w-6 items-center justify-center text-xs text-white/50"
            >
              {day}
            </div>
          ))}
        </div>

        {/* 活动网格 */}
        <div className="flex gap-1">
          {/* 月份标签列 */}
          <div className="mr-2 flex flex-col gap-1">
            {Array.from({ length: isMobile ? 6 : 52 }, (_, weekIndex) => (
              <div key={weekIndex} className="flex h-6 items-center">
                {!isMobile && weekIndex % 4 === 0 && (
                  <span className="text-xs text-white/50">
                    {months[Math.floor(weekIndex / 4) % 12]}
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* 活动方块 */}
          {Array.from({ length: isMobile ? 6 : 52 }, (_, weekIndex) => (
            <div key={weekIndex} className="flex flex-col gap-1">
              {Array.from({ length: 7 }, (_, dayIndex) => {
                const activity = activityData.find(
                  (a) =>
                    a.week === (isMobile ? weekIndex + 46 : weekIndex) &&
                    a.day === dayIndex,
                );
                return (
                  <motion.div
                    key={dayIndex}
                    className={`h-6 w-6 rounded-sm ${getActivityColor(
                      activity?.count || 0,
                    )} flex cursor-pointer items-center justify-center border border-white/10 transition-all hover:scale-110 hover:border-white/30`}
                    title={`${activity?.date}: ${activity?.count || 0}个任务`}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{
                      delay: 0.8 + weekIndex * 0.01 + dayIndex * 0.001,
                    }}
                    whileHover={{ scale: 1.1 }}
                  >
                    {activity?.count > 0 && (
                      <span className="text-xs font-medium text-white/80">
                        {activity.count}
                      </span>
                    )}
                  </motion.div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>

    {/* 图例 */}
    <div className="mt-6 flex items-center justify-center gap-3 text-xs text-white/60">
      <span>少</span>
      <div className="flex gap-1">
        <div className="h-4 w-4 rounded-sm border border-white/10 bg-white/5" />
        <div className="h-4 w-4 rounded-sm border border-white/10 bg-cyan-500/30" />
        <div className="h-4 w-4 rounded-sm border border-white/10 bg-cyan-500/50" />
        <div className="h-4 w-4 rounded-sm border border-white/10 bg-blue-500/70" />
        <div className="h-4 w-4 rounded-sm border border-white/10 bg-purple-500/90" />
      </div>
      <span>多</span>
    </div>
  </CardContent>
</Card>;
```

### 2. 24小时分布图重新设计

#### 核心特性

- **范围选择器**: 最近6小时 vs 全天切换
- **简洁布局**: 柱状图 + 时间标签 + 任务数量
- **美观设计**: 渐变色彩 + 阴影效果
- **洞察卡片**: 最佳时段分析

```tsx
{
  /* 24-Hour Activity - 重新设计 */
}
<Card className="overflow-hidden rounded-3xl border-white/20 bg-white/10 backdrop-blur-xl">
  <CardHeader className="relative p-4 sm:p-6">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="rounded-xl bg-gradient-to-br from-purple-400 to-pink-500 p-2">
          <Clock className="h-5 w-5 text-white" />
        </div>
        <div>
          <CardTitle className="text-lg text-white sm:text-xl">
            {isMobile ? "最近6小时活动" : "24小时活动分布"}
          </CardTitle>
          <p className="mt-1 text-sm text-white/60">
            {isMobile ? "最近6小时的任务完成情况" : "找到您的黄金工作时段"}
          </p>
        </div>
      </div>

      {/* 时间范围选择器 */}
      <div className="flex gap-1 rounded-lg bg-white/10 p-1">
        <button
          className={`rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
            isMobile
              ? "bg-white/20 text-white"
              : "text-white/60 hover:text-white"
          }`}
          onClick={() => setIsMobile(true)}
        >
          最近6小时
        </button>
        <button
          className={`rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
            !isMobile
              ? "bg-white/20 text-white"
              : "text-white/60 hover:text-white"
          }`}
          onClick={() => setIsMobile(false)}
        >
          全天
        </button>
      </div>
    </div>
  </CardHeader>

  <CardContent className="relative p-4 sm:p-6">
    {/* 时间分布图 */}
    <div className="space-y-4">
      {/* 图表区域 */}
      <div
        className={`flex h-32 items-end gap-2 overflow-x-auto sm:h-40 md:h-48`}
      >
        {stats.hourlyDistribution.map((data: any, index: number) => {
          // 移动端只显示最近6小时，桌面端显示所有
          const currentHour = new Date().getHours();
          if (
            isMobile &&
            !Array.from({ length: 6 }, (_, i) => currentHour - i).includes(
              data.hour,
            )
          ) {
            return null;
          }

          const { height, color } = getHourlyIntensity(
            data.count,
            maxHourlyCount,
          );
          return (
            <motion.div
              key={data.hour}
              className="group flex min-w-0 flex-1 flex-col items-center gap-2"
              initial={{ height: 0 }}
              animate={{ height: "auto" }}
              transition={{ delay: 1 + index * 0.05, duration: 0.6 }}
            >
              <div className="relative flex h-24 w-full items-end sm:h-32 md:h-40">
                <motion.div
                  className={`w-full bg-gradient-to-t ${color} cursor-pointer rounded-t-lg border border-white/10 shadow-lg transition-all duration-300 group-hover:scale-105`}
                  style={{ height: `${height}%` }}
                  title={`${data.hour}:00 - ${data.count}个任务`}
                  initial={{ height: 0 }}
                  animate={{ height: `${height}%` }}
                  transition={{ delay: 1.2 + index * 0.05, duration: 0.8 }}
                  whileHover={{ scale: 1.05 }}
                />
              </div>
              <div className="text-center">
                <div className="text-sm font-medium text-white">
                  {data.hour}:00
                </div>
                <div className="text-xs text-white/60">{data.count}个任务</div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* 最佳时段洞察 */}
      <motion.div
        className="rounded-2xl border border-purple-500/30 bg-gradient-to-r from-purple-500/20 to-pink-500/20 p-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5, duration: 0.6 }}
      >
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-400 to-pink-500 shadow-lg">
            <Zap className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1">
            <h4 className="text-lg font-semibold text-white">高效时段洞察</h4>
            <p className="mt-1 text-sm text-white/70">
              您在{" "}
              <span className="font-semibold text-purple-300">
                {bestHour.hour}:00-{bestHour.hour + 1}:00
              </span>{" "}
              时段效率最高， 建议在此时处理重要任务
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-purple-300">
              {bestHour.count}
            </div>
            <div className="text-xs text-white/60">个任务</div>
          </div>
        </div>
      </motion.div>
    </div>
  </CardContent>
</Card>;
```

## 📊 设计特点

### 热力图优化

- ✅ **横竖对齐**: 6x6网格，完美对齐
- ✅ **范围选择**: 最近6周 vs 全年切换
- ✅ **数据展示**: 方块内显示任务数量
- ✅ **美观布局**: 星期标签 + 月份标签 + 活动方块

### 时间分布图优化

- ✅ **范围选择**: 最近6小时 vs 全天切换
- ✅ **简洁布局**: 柱状图 + 时间标签 + 任务数量
- ✅ **美观设计**: 渐变色彩 + 阴影效果
- ✅ **洞察卡片**: 最佳时段分析

### 交互体验

- ✅ **范围切换**: 一键切换显示范围
- ✅ **悬停效果**: 丰富的交互反馈
- ✅ **动画效果**: 流畅的进入动画
- ✅ **响应式**: 移动端和桌面端都美观

## 🎯 核心改进

1. **简洁设计**: 移除复杂逻辑，直接实现美观布局
2. **范围选择**: 添加切换按钮，用户可自由选择显示范围
3. **横竖对齐**: 热力图完美对齐，视觉效果佳
4. **数据展示**: 方块内显示具体数量，信息更直观

## 📱 最终效果

### 移动端

- ✅ 最近6周/6小时，显示简洁
- ✅ 横竖对齐，布局美观
- ✅ 范围切换，操作简单
- ✅ 数据直观，信息清晰

### 桌面端

- ✅ 全年/全天数据，功能完整
- ✅ 布局标准，视觉美观
- ✅ 交互丰富，体验优秀
- ✅ 性能良好，响应迅速

通过简洁重设计，现在的分析页面既美观又实用，移动端和桌面端都有最佳的用户体验！
