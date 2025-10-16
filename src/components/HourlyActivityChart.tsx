'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, Zap, TrendingUp, BarChart3, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface HourlyActivityChartProps {
  hourlyDistribution: Array<{
    hour: number;
    count: number;
  }>;
}

export default function HourlyActivityChart({ hourlyDistribution }: HourlyActivityChartProps) {
  const [viewMode, setViewMode] = useState<'recent' | 'full'>('recent');
  const [chartType, setChartType] = useState<'bar' | 'line'>('bar');
  const [isMobile, setIsMobile] = useState(false);
  const [currentTimeSlot, setCurrentTimeSlot] = useState(0); // 移动端时间槽索引

  // 检测设备类型和设置默认时段
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);

    // 设置默认时段基于当前时间
    const currentHour = new Date().getHours();
    const defaultTimeSlot = Math.floor(currentHour / 6); // 每6小时一个时段
    setCurrentTimeSlot(Math.min(defaultTimeSlot, 3)); // 最多4个时段(0-3)

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // 计算统计数据
  const maxHourlyCount = Math.max(...hourlyDistribution.map(d => d.count));
  const bestHour = hourlyDistribution.reduce((max, curr) =>
    curr.count > max.count ? curr : max,
    { hour: 9, count: 0 }
  );
  const totalTasks = hourlyDistribution.reduce((sum, d) => sum + d.count, 0);
  const activeHours = hourlyDistribution.filter(d => d.count > 0).length;


  // 获取显示的数据
  const getDisplayData = () => {
    if (isMobile) {
      // 移动端：显示6小时时间槽
      const startHour = currentTimeSlot * 6;
      return hourlyDistribution.slice(startHour, startHour + 6);
    } else if (viewMode === 'recent') {
      // PC端：显示最近6小时（从当前时间往前推6小时）
      const currentHour = new Date().getHours();
      const recentHours = [];

      for (let i = 5; i >= 0; i--) {
        const hour = (currentHour - i + 24) % 24;
        const hourData = hourlyDistribution.find(d => d.hour === hour);
        recentHours.push(hourData ?? { hour, count: 0 });
      }

      return recentHours;
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

  // 移动端时间槽切换函数
  const handlePreviousTimeSlot = () => {
    setCurrentTimeSlot(prev => Math.max(0, prev - 1));
  };

  const handleNextTimeSlot = () => {
    const maxSlots = Math.ceil(24 / 6) - 1; // 总共4个时间槽（0-3）
    setCurrentTimeSlot(prev => Math.min(maxSlots, prev + 1));
  };

  // 获取当前时间槽的时间范围
  const getCurrentTimeSlotRange = () => {
    const startHour = currentTimeSlot * 6;
    const endHour = Math.min(startHour + 5, 23);
    return `${startHour}:00-${endHour}:59`;
  };

  return (
    <Card className="rounded-2xl md:rounded-3xl bg-white/10 backdrop-blur-xl border-white/20 overflow-hidden">
      <CardHeader className="p-3 md:p-4 relative overflow-hidden">
        {/* 背景发光效果 */}
        <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 via-emerald-500/10 to-green-500/5"></div>

        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="p-1.5 md:p-2 rounded-lg md:rounded-xl bg-gradient-to-br from-green-400 to-emerald-500 shadow-lg shadow-green-500/30 hover:shadow-green-500/50 transition-all duration-300">
              <Clock className="w-3 h-3 md:w-5 md:h-5 text-white drop-shadow-lg" />
            </div>
            <div>
              <CardTitle className="text-green-100 text-sm md:text-lg font-bold drop-shadow-lg">
                24小时活动分布
              </CardTitle>
              <p className="text-green-200/70 text-xs md:text-sm mt-1">
                找到您的黄金工作时段
              </p>
            </div>
          </div>

          {/* 控制按钮组 */}
          <div className="flex gap-1">
            {isMobile ? (
              /* 移动端：时间槽切换 */
              <div className="flex items-center gap-1 bg-white/10 rounded-lg p-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-2 text-white/70 hover:text-white hover:bg-white/20 transition-all"
                  onClick={handlePreviousTimeSlot}
                  disabled={currentTimeSlot === 0}
                >
                  <ChevronLeft className="w-5 h-5" />
                </Button>
                <span className="text-white text-sm font-medium min-w-[90px] text-center px-2">
                  {getCurrentTimeSlotRange()}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-2 text-white/70 hover:text-white hover:bg-white/20 transition-all"
                  onClick={handleNextTimeSlot}
                  disabled={currentTimeSlot >= 3}
                >
                  <ChevronRight className="w-5 h-5" />
                </Button>
              </div>
            ) : (
              /* PC端：时间范围选择 */
              <div className="flex gap-1">
                <div className="flex gap-1 bg-white/10 rounded-lg p-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`px-3 py-1.5 text-xs md:px-4 md:py-2 md:text-sm font-medium transition-all ${
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
                    className={`px-3 py-1.5 text-xs md:px-4 md:py-2 md:text-sm font-medium transition-all ${
                      viewMode === 'full'
                        ? 'bg-white/20 text-white'
                        : 'text-white/60 hover:text-white'
                    }`}
                    onClick={() => setViewMode('full')}
                  >
                    全天
                  </Button>
                </div>

                {/* 图表类型选择 */}
                <div className="flex gap-1 bg-white/10 rounded-lg p-1">
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
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-3 md:p-4">
        {/* 统计信息 */}
        <div className="flex gap-2 md:gap-4 mb-4">
          <div className="flex-1 text-center p-2 md:p-3 rounded-lg bg-gradient-to-br from-green-500/10 to-emerald-500/5 border border-green-500/20 shadow-lg shadow-green-500/10 hover:shadow-green-500/20 transition-all duration-300 hover:scale-105">
            <div className="text-green-300 text-sm md:text-lg font-bold drop-shadow-lg">{totalTasks}</div>
            <div className="text-green-200/70 text-xs">总任务</div>
          </div>
          <div className="flex-1 text-center p-2 md:p-3 rounded-lg bg-gradient-to-br from-green-500/10 to-emerald-500/5 border border-green-500/20 shadow-lg shadow-green-500/10 hover:shadow-green-500/20 transition-all duration-300 hover:scale-105">
            <div className="text-green-300 text-sm md:text-lg font-bold drop-shadow-lg">{activeHours}</div>
            <div className="text-green-200/70 text-xs">活跃时段</div>
          </div>
          <div className="flex-1 text-center p-2 md:p-3 rounded-lg bg-gradient-to-br from-green-500/10 to-emerald-500/5 border border-green-500/20 shadow-lg shadow-green-500/10 hover:shadow-green-500/20 transition-all duration-300 hover:scale-105">
            <div className="text-green-300 text-sm md:text-lg font-bold drop-shadow-lg">{bestHour.hour}:00</div>
            <div className="text-green-200/70 text-xs">最佳时段</div>
          </div>
          <div className="flex-1 text-center p-2 md:p-3 rounded-lg bg-gradient-to-br from-green-500/10 to-emerald-500/5 border border-green-500/20 shadow-lg shadow-green-500/10 hover:shadow-green-500/20 transition-all duration-300 hover:scale-105">
            <div className="text-green-300 text-sm md:text-lg font-bold drop-shadow-lg">{bestHour.count}</div>
            <div className="text-green-200/70 text-xs">最高产量</div>
          </div>
        </div>

        {/* 图表区域 */}
        <div className="space-y-4">
          {/* 图表 */}
          <div className="w-full h-32 md:h-40 relative">
            {/* 图表容器 */}
            <div className="relative bg-black/5 rounded-lg border border-green-500/20 shadow-lg shadow-green-500/10 h-full">
              {displayData.length > 0 ? (
                chartType === 'bar' ? (
                  /* 柱状图 - 使用 Recharts */
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={displayData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(34, 197, 94, 0.2)" />
                      <XAxis
                        dataKey="hour"
                        tick={{ fill: 'rgba(34, 197, 94, 0.8)', fontSize: 12 }}
                        tickFormatter={(value) => `${value}:00`}
                      />
                      <YAxis
                        tick={{ fill: 'rgba(34, 197, 94, 0.8)', fontSize: 12 }}
                        domain={[0, 'dataMax + 1']}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'rgba(0,0,0,0.9)',
                          border: '1px solid rgba(34, 197, 94, 0.5)',
                          borderRadius: '12px',
                          color: 'white',
                          boxShadow: '0 0 20px rgba(34, 197, 94, 0.3)',
                          backdropFilter: 'blur(10px)'
                        }}
                        formatter={(value: number) => [`${value}个任务`, '任务数']}
                        labelFormatter={(label) => `${label}:00`}
                      />
                      <Bar
                        dataKey="count"
                        fill="#22c55e"
                        radius={[4, 4, 0, 0]}
                        stroke="rgba(34, 197, 94, 0.8)"
                        strokeWidth={2}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  /* 折线图 - 使用 Recharts */
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={displayData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(34, 197, 94, 0.2)" />
                      <XAxis
                        dataKey="hour"
                        tick={{ fill: 'rgba(34, 197, 94, 0.8)', fontSize: 12 }}
                        tickFormatter={(value) => `${value}:00`}
                      />
                      <YAxis
                        tick={{ fill: 'rgba(34, 197, 94, 0.8)', fontSize: 12 }}
                        domain={[0, 'dataMax + 1']}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'rgba(0,0,0,0.9)',
                          border: '1px solid rgba(34, 197, 94, 0.5)',
                          borderRadius: '12px',
                          color: 'white',
                          boxShadow: '0 0 20px rgba(34, 197, 94, 0.3)',
                          backdropFilter: 'blur(10px)'
                        }}
                        formatter={(value: number) => [`${value}个任务`, '任务数']}
                        labelFormatter={(label) => `${label}:00`}
                      />
                      <Line
                        type="monotone"
                        dataKey="count"
                        stroke="#22c55e"
                        strokeWidth={3}
                        dot={{
                          fill: '#22c55e',
                          stroke: 'rgba(255,255,255,0.9)',
                          strokeWidth: 2,
                          r: 4
                        }}
                        activeDot={{
                          r: 6,
                          stroke: '#22c55e',
                          strokeWidth: 3,
                          fill: 'rgba(255,255,255,0.9)'
                        }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )
              ) : (
                <div className="flex items-center justify-center h-full text-white/60">
                  暂无数据
                </div>
              )}
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
