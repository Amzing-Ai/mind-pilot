'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, Zap, TrendingUp, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface HourlyActivityChartProps {
  hourlyDistribution: any[];
}

export default function HourlyActivityChart({ hourlyDistribution }: HourlyActivityChartProps) {
  const [viewMode, setViewMode] = useState<'recent' | 'full'>('recent');
  const [chartType, setChartType] = useState<'bar' | 'line'>('bar');

  // 计算统计数据
  const maxHourlyCount = Math.max(...hourlyDistribution.map((d: any) => d.count));
  const bestHour = hourlyDistribution.reduce((max: any, curr: any) =>
    curr.count > max.count ? curr : max,
    { hour: 9, count: 0 }
  );
  const totalTasks = hourlyDistribution.reduce((sum, d: any) => sum + d.count, 0);
  const activeHours = hourlyDistribution.filter((d: any) => d.count > 0).length;

  // 获取小时强度的颜色和高度
  const getHourlyIntensity = (count: number) => {
    const percentage = maxHourlyCount > 0 ? (count / maxHourlyCount) * 100 : 0;

    let color = 'from-cyan-400/30 to-cyan-500/30';
    if (percentage > 75) color = 'from-purple-500/70 to-pink-500/70';
    else if (percentage > 50) color = 'from-blue-500/60 to-purple-500/60';
    else if (percentage > 25) color = 'from-cyan-500/40 to-blue-500/40';

    return { height: Math.max(percentage, 5), color };
  };

  // 获取显示的数据
  const getDisplayData = () => {
    if (viewMode === 'recent') {
      // 显示最近6小时
      const currentHour = new Date().getHours();
      return hourlyDistribution.filter((_, index) => {
        const hour = (currentHour - 5 + index + 24) % 24;
        return index >= Math.max(0, 24 - 6) || hour <= currentHour;
      }).slice(-6);
    }
    return hourlyDistribution;
  };

  const displayData = getDisplayData();

  // 计算效率时段
  const getEfficiencyPeriods = () => {
    const sortedHours = [...hourlyDistribution]
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);

    return sortedHours.map(hour => ({
      hour: hour.hour,
      count: hour.count,
      percentage: Math.round((hour.count / maxHourlyCount) * 100)
    }));
  };

  const efficiencyPeriods = getEfficiencyPeriods();

  return (
    <Card className="rounded-2xl md:rounded-3xl bg-white/10 backdrop-blur-xl border-white/20 overflow-hidden">
      <CardHeader className="p-3 md:p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="p-1.5 md:p-2 rounded-lg md:rounded-xl bg-gradient-to-br from-purple-400 to-pink-500">
              <Clock className="w-3 h-3 md:w-5 md:h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-white text-sm md:text-lg">
                24小时活动分布
              </CardTitle>
              <p className="text-white/60 text-xs md:text-sm mt-1">
                找到您的黄金工作时段
              </p>
            </div>
          </div>

          {/* 控制按钮组 */}
          <div className="flex gap-1">
            {/* 时间范围选择 */}
            <div className="flex gap-1 bg-white/10 rounded-lg p-1">
              <Button
                variant="ghost"
                size="sm"
                className={`px-2 py-1.5 text-xs md:px-4 md:py-2 md:text-sm font-medium transition-all ${
                  viewMode === 'recent'
                    ? 'bg-white/20 text-white'
                    : 'text-white/60 hover:text-white'
                }`}
                onClick={() => setViewMode('recent')}
              >
                最近6小时
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={`px-2 py-1.5 text-xs md:px-4 md:py-2 md:text-sm font-medium transition-all ${
                  viewMode === 'full'
                    ? 'bg-white/20 text-white'
                    : 'text-white/60 hover:text-white'
                }`}
                onClick={() => setViewMode('full')}
              >
                全天
              </Button>
            </div>

            {/* 图表类型选择 - 只在桌面端显示 */}
            <div className="hidden md:flex gap-1 bg-white/10 rounded-lg p-1">
              <Button
                variant="ghost"
                size="sm"
                className={`p-1.5 transition-all ${
                  chartType === 'bar'
                    ? 'bg-white/20 text-white'
                    : 'text-white/60 hover:text-white'
                }`}
                onClick={() => setChartType('bar')}
              >
                <BarChart3 className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={`p-1.5 transition-all ${
                  chartType === 'line'
                    ? 'bg-white/20 text-white'
                    : 'text-white/60 hover:text-white'
                }`}
                onClick={() => setChartType('line')}
              >
                <TrendingUp className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-3 md:p-4">
        {/* 统计信息 */}
        <div className="flex gap-2 md:gap-4 mb-4">
          <div className="flex-1 text-center p-2 md:p-3 rounded-lg bg-white/5">
            <div className="text-white text-sm md:text-lg font-bold">{totalTasks}</div>
            <div className="text-white/60 text-xs">总任务</div>
          </div>
          <div className="flex-1 text-center p-2 md:p-3 rounded-lg bg-white/5">
            <div className="text-white text-sm md:text-lg font-bold">{activeHours}</div>
            <div className="text-white/60 text-xs">活跃时段</div>
          </div>
          <div className="flex-1 text-center p-2 md:p-3 rounded-lg bg-white/5">
            <div className="text-white text-sm md:text-lg font-bold">{bestHour.hour}:00</div>
            <div className="text-white/60 text-xs">最佳时段</div>
          </div>
          <div className="flex-1 text-center p-2 md:p-3 rounded-lg bg-white/5">
            <div className="text-white text-sm md:text-lg font-bold">{bestHour.count}</div>
            <div className="text-white/60 text-xs">最高产量</div>
          </div>
        </div>

        {/* 图表区域 */}
        <div className="space-y-4">
          {/* 柱状图 */}
          <div className="w-full">
            <div className="flex items-end gap-0.5 md:gap-1 h-24 md:h-32 overflow-x-auto">
              {displayData.map((data: any, index: number) => {
                const { height, color } = getHourlyIntensity(data.count);
                const isCurrentHour = data.hour === new Date().getHours();

                return (
                  <motion.div
                    key={data.hour}
                    className="flex-1 flex flex-col items-center justify-end group cursor-pointer min-w-0"
                    initial={{ height: 0 }}
                    animate={{ height: 'auto' }}
                    transition={{ delay: 0.1 + index * 0.05, duration: 0.6 }}
                  >
                    <motion.div
                      className={`w-full rounded-t-sm transition-all duration-300 group-hover:scale-105 border border-white/10 shadow-sm relative ${
                        isCurrentHour ? 'ring-2 ring-cyan-400/50' : ''
                      }`}
                      style={{
                        height: `${height}%`,
                        background: `linear-gradient(to top, ${color.replace('from-', '').replace(' to-', ', ')})`
                      }}
                      title={`${data.hour}:00 - ${data.count}个任务`}
                      initial={{ height: 0 }}
                      animate={{ height: `${height}%` }}
                      transition={{ delay: 0.2 + index * 0.05, duration: 0.8 }}
                      whileHover={{ scale: 1.05 }}
                    >
                      {/* 当前时间指示器 */}
                      {isCurrentHour && (
                        <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
                      )}
                    </motion.div>
                  </motion.div>
                );
              })}
            </div>

            {/* 时间标签 */}
            <div className="flex gap-0.5 md:gap-1 mt-2">
              {displayData.map((data: any, index: number) => {
                const isCurrentHour = data.hour === new Date().getHours();
                return (
                  <div key={data.hour} className="flex-1 text-center">
                    <div className={`text-xs md:text-sm font-medium ${
                      isCurrentHour ? 'text-cyan-300' : 'text-white'
                    }`}>
                      {data.hour}:00
                    </div>
                    <div className="text-xs text-white/60">
                      {data.count}个
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 效率时段洞察 */}
          <motion.div
            className="p-3 md:p-4 rounded-xl md:rounded-2xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            <div className="flex items-center gap-3 md:gap-4">
              <div className="w-8 h-8 md:w-12 md:h-12 rounded-lg md:rounded-xl bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center shadow-lg">
                <Zap className="w-4 h-4 md:w-6 md:h-6 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="text-white text-sm md:text-lg font-semibold">高效时段洞察</h4>
                <p className="text-white/70 text-xs md:text-sm mt-1">
                  您在 <span className="text-purple-300 font-semibold">{bestHour.hour}:00-{bestHour.hour + 1}:00</span> 时段效率最高，
                  建议在此时处理重要任务
                </p>
              </div>
              <div className="text-right">
                <div className="text-lg md:text-2xl font-bold text-purple-300">
                  {bestHour.count}
                </div>
                <div className="text-xs text-white/60">
                  个任务
                </div>
              </div>
            </div>
          </motion.div>

          {/* 前3高效时段 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-3">
            {efficiencyPeriods.map((period, index) => (
              <motion.div
                key={period.hour}
                className="p-2 md:p-3 rounded-lg bg-white/5 border border-white/10"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.7 + index * 0.1, duration: 0.5 }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-white text-sm md:text-base font-medium">
                      {period.hour}:00-{period.hour + 1}:00
                    </div>
                    <div className="text-white/60 text-xs">
                      第{index + 1}高效时段
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-white text-sm md:text-base font-bold">
                      {period.count}
                    </div>
                    <div className="text-white/60 text-xs">
                      {period.percentage}%
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
