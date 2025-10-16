'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface ActivityHeatmapProps {
  activityData: Array<{
    date: string;
    count: number;
  }>;
}

export default function ActivityHeatmap({ activityData }: ActivityHeatmapProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [squareHeight, setSquareHeight] = useState(12);
  const [isMobile, setIsMobile] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // 获取活动强度的颜色（基于图片的绿色系）
  // const getActivityColor = (count: number) => {
  //   if (count === 0) return 'bg-gray-600/20'; // 无活动时的灰色
  //   if (count <= 2) return 'bg-green-500/40';
  //   if (count <= 4) return 'bg-green-500/60';
  //   if (count <= 6) return 'bg-green-500/80';
  //   return 'bg-green-500'; // 高活动时的深绿色
  // };

  // 获取活动强度的透明度
  const getActivityOpacity = (count: number) => {
    if (count === 0) return 0.2;
    return Math.min(0.4 + (count / 8) * 0.6, 1);
  };

  // 获取当前月份的数据
  const getCurrentMonthData = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    // 获取当月第一天和最后一天
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    // 获取当月第一天是星期几（0=周日，1=周一...）
    const firstDayOfWeek = firstDay.getDay();
    const daysInMonth = lastDay.getDate();

    // 创建日历网格数据
    const calendarData = [];

    // 添加月初的空白天数（如果第一天不是周一）
    const startDay = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1; // 转换为周一为0的格式
    for (let i = 0; i < startDay; i++) {
      calendarData.push({
        day: null,
        date: '',
        count: 0,
        isCurrentMonth: false
      });
    }

    // 添加当月的每一天
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      // 避免时区问题，直接构造日期字符串
      const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

      // 查找对应的活动数据
      const activity = activityData.find(a => a.date === dateString);

      calendarData.push({
        day: day,
        date: dateString,
        count: activity?.count ?? 0,
        isCurrentMonth: true
      });
    }

    return calendarData;
  };

  const monthData = getCurrentMonthData();

  // 调试日志
  useEffect(() => {
    console.log("热力图接收到的数据条数:", activityData.length);
    console.log("当前月份:", currentMonth.getFullYear(), currentMonth.getMonth() + 1);
    console.log("当前月份数据条数:", monthData.length);
    console.log("当前月份有数据的日期:", monthData.filter(d => d.count > 0));
    // 构造今天的日期字符串，避免时区问题
    const today = new Date(2025, 9, 16); // 2025年10月16日
    const todayString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    console.log("今天的数据:", activityData.find(d => d.date === todayString));
  }, [activityData, monthData, currentMonth]);

  // 检测设备类型
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // 计算方块高度 - 固定高度，宽度自适应
  const calculateSquareHeight = useCallback(() => {
    // 固定高度，让布局更紧凑，高度加5px
    const height = isMobile ? 15 : 17;
    setSquareHeight(height);
  }, [isMobile]);

  // 监听窗口大小变化
  useEffect(() => {
    calculateSquareHeight();
    const handleResize = () => calculateSquareHeight();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isMobile, calculateSquareHeight]);

  // 月份切换函数
  const handlePreviousMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  return (
    <Card className="rounded-2xl md:rounded-3xl bg-white/10 backdrop-blur-xl border-white/20 overflow-hidden">
      <CardHeader className="p-3 md:p-4">
        <div className="flex items-center justify-between">
          {/* 标题部分 - 按照图片样式 */}
          <div className="flex items-center gap-2 md:gap-3">
            <div className="p-1.5 md:p-2 rounded-lg md:rounded-xl bg-gradient-to-br from-green-400 to-emerald-500">
              <Calendar className="w-3 h-3 md:w-5 md:h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-white text-sm md:text-lg">
                活动热力图
              </CardTitle>
              <p className="text-white/60 text-xs md:text-sm mt-1">
                任务完成情况可视化
              </p>
            </div>
          </div>

          {/* 月份导航 - 统一风格 */}
          <div className="flex items-center gap-1 bg-white/10 rounded-lg p-1">
            <Button
              variant="ghost"
              size="sm"
              className="p-2 text-white/70 hover:text-white hover:bg-white/20 transition-all"
              onClick={handlePreviousMonth}
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <span className="text-white text-sm font-medium min-w-[90px] text-center px-2">
              {currentMonth.getFullYear()}年{currentMonth.getMonth() + 1}月
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="p-2 text-white/70 hover:text-white hover:bg-white/20 transition-all"
              onClick={handleNextMonth}
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-3 md:p-4">
        {/* 热力图 - 月份日历布局 */}
        <div className="w-full" ref={containerRef}>
          {/* 星期标签行 - 与日历对齐 */}
          <div className="grid grid-cols-7 gap-0.5 mb-1">
            {['一', '二', '三', '四', '五', '六', '日'].map((day, index) => (
              <div
                key={index}
                className="flex items-center justify-center text-white/50 font-medium"
                style={{
                  height: `${squareHeight}px`,
                  fontSize: isMobile ? '8px' : '10px'
                }}
              >
                {day}
              </div>
            ))}
          </div>

          {/* 日历网格 - 7列布局，按周分行，上下加1px间距 */}
          <div className="grid grid-cols-7 gap-0.5 gap-y-1">
            {monthData.map((dayData, index) => (
              <motion.div
                key={index}
                className={`rounded-sm border border-white/10 transition-all hover:scale-110 hover:border-white/30 cursor-pointer flex items-center justify-center ${
                  dayData.isCurrentMonth ? '' : 'opacity-30'
                }`}
                style={{
                  height: `${squareHeight}px`,
                  backgroundColor: dayData.isCurrentMonth && dayData.count > 0
                    ? `rgba(34, 197, 94, ${getActivityOpacity(dayData.count)})`
                    : dayData.isCurrentMonth
                      ? 'rgba(75, 85, 99, 0.2)' // 当月无活动
                      : 'transparent' // 非当月
                }}
                title={dayData.isCurrentMonth ? `${dayData.date}: ${dayData.count}个任务` : ''}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: index * 0.005 }}
                whileHover={{ scale: 1.1 }}
              >
                {dayData.isCurrentMonth && dayData.count > 0 && squareHeight >= 10 && (
                  <span
                    className="text-white/80 font-medium"
                    style={{ fontSize: `${Math.max(6, squareHeight * 0.6)}px` }}
                  >
                    {dayData.count}
                  </span>
                )}
              </motion.div>
            ))}
          </div>
        </div>


        {/* 图例 - 紧凑布局 */}
        <div className="flex items-center justify-center gap-2 mt-3 text-xs text-white/60">
          <span>少</span>
          <div className="flex gap-0.5">
            {[0, 1, 2, 3, 4].map((level) => (
              <div
                key={level}
                className="w-2.5 h-2.5 rounded-sm border border-white/10"
                style={{
                  backgroundColor: level > 0
                    ? `rgba(34, 197, 94, ${0.4 + (level / 4) * 0.6})`
                    : 'rgba(75, 85, 99, 0.2)'
                }}
              />
            ))}
          </div>
          <span>多</span>
        </div>
      </CardContent>
    </Card>
  );
}
