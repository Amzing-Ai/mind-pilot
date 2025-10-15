'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface ActivityHeatmapProps {
  activityData: any[];
}

export default function ActivityHeatmap({ activityData }: ActivityHeatmapProps) {
  const [viewMode, setViewMode] = useState<'recent' | 'full'>('recent');
  const [currentWeek, setCurrentWeek] = useState(0);
  const [squareSize, setSquareSize] = useState(16); // 默认16px
  const [isMobile, setIsMobile] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // 获取活动强度的颜色
  const getActivityColor = (count: number) => {
    if (count === 0) return 'bg-white/5';
    if (count <= 2) return 'bg-emerald-500/30';
    if (count <= 4) return 'bg-emerald-500/50';
    if (count <= 6) return 'bg-green-500/70';
    return 'bg-lime-500/90';
  };

  // 获取活动强度的透明度
  const getActivityOpacity = (count: number) => {
    if (count === 0) return 0.05;
    return Math.min(0.1 + (count / 8) * 0.4, 0.5);
  };

  // 计算显示的数据范围
  const getDisplayData = () => {
    if (viewMode === 'recent') {
      // 显示最近12周（从第40周到第51周，即最近12周）
      // 移动端显示8周，桌面端显示12周
      const weekCount = isMobile ? 8 : 12;
      return Array.from({ length: weekCount }, (_, weekIndex) => {
        const week = weekIndex + (isMobile ? 44 : 40); // 移动端从第44周开始，显示8周
        // 直接生成7天数据，确保结构完整
        return Array.from({ length: 7 }, (_, dayIndex) => {
          const activity = activityData.find(
            a => a.week === week && a.day === dayIndex
          );

          // 调试：检查数据查找情况
          if (weekIndex === 0 && dayIndex === 0) {
            console.log(`Week ${week} Day ${dayIndex} lookup:`, {
              found: !!activity,
              activity,
              totalActivityData: activityData.length,
              availableWeeks: [...new Set(activityData.map(a => a.week))].sort((a, b) => a - b)
            });
          }

          return {
            count: activity?.count || 0,
            date: activity?.date || '',
            week: week,
            day: dayIndex
          };
        });
      });
    } else {
      // 显示全年数据，支持分页（从第0周到第51周）
      const startWeek = currentWeek * 12;
      const endWeek = Math.min(startWeek + 12, 52);
      const actualWeekCount = endWeek - startWeek;

      // 始终返回12周的数据结构，不足的用空数据填充
      return Array.from({ length: 12 }, (_, weekIndex) => {
        if (weekIndex < actualWeekCount) {
          // 有实际数据的周
          const week = startWeek + weekIndex;
          return Array.from({ length: 7 }, (_, dayIndex) => {
            const activity = activityData.find(
              a => a.week === week && a.day === dayIndex
            );
            return {
              count: activity?.count || 0,
              date: activity?.date || '',
              week: week,
              day: dayIndex
            };
          });
        } else {
          // 空数据填充，保持结构一致
          return Array.from({ length: 7 }, (_, dayIndex) => ({
            count: 0,
            date: '',
            week: -1, // 标记为无效周
            day: dayIndex
          }));
        }
      });
    }
  };

  const displayData = getDisplayData();
  const maxPages = Math.ceil(52 / 12);

  // 检测设备类型
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // 调试：输出数据结构
  console.log('🔍 DisplayData Debug:', {
    viewMode,
    currentWeek,
    isMobile,
    displayDataLength: displayData.length,
    actualDataWeeks: displayData.filter(week => week[0]?.week !== -1).length,
    emptyWeeks: displayData.filter(week => week[0]?.week === -1).length,
    totalLabels: displayData.reduce((sum, week) => sum + week.filter(d => d.week !== -1).length, 0),
    totalGrids: displayData.reduce((sum, week) => sum + week.length, 0),
    firstWeek: displayData[0]?.[0]?.week,
    lastWeek: displayData[displayData.length - 1]?.[0]?.week
  });

  // 直接计算方块大小：容器宽度 - 间隙 = 方块总宽度，然后除以个数
  const calculateSquareSize = () => {
    if (!containerRef.current) return;

    setTimeout(() => {
      if (!containerRef.current) return;

      const container = containerRef.current;
      const containerWidth = container.offsetWidth;

      // 每行方块数量（移动端8个，桌面端12个）
      const squareCount = isMobile ? 8 : 12;
      // 间隙大小：移动端2px，桌面端4px
      const gapSize = isMobile ? 2 : 4;
      // 总间隙 = (个数-1) * 间隙
      const totalGaps = (squareCount - 1) * gapSize;

      // 方块总宽度 = 容器宽度 - 总间隙
      const totalSquareWidth = containerWidth - totalGaps;
      // 每个方块宽度 = 方块总宽度 / 个数
      const squareWidth = totalSquareWidth / squareCount;

      // 取整并设置
      const finalSize = Math.floor(squareWidth);

      console.log('直接计算:', {
        containerWidth,
        squareCount,
        gapSize,
        totalGaps,
        totalSquareWidth,
        squareWidth,
        finalSize,
        isMobile
      });

      setSquareSize(finalSize);
    }, 50);
  };

  // 监听窗口大小变化和显示数据变化
  useEffect(() => {
    calculateSquareSize();

    const handleResize = () => {
      calculateSquareSize();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [displayData, viewMode, currentWeek, isMobile]);

  return (
    <Card className="rounded-2xl md:rounded-3xl bg-white/10 backdrop-blur-xl border-white/20 overflow-hidden">
      <CardHeader className="p-3 md:p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="p-1.5 md:p-2 rounded-lg md:rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500">
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

          {/* 控制按钮组 */}
          <div className="flex gap-1">
            {/* 视图模式切换 */}
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
                最近12周
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
                全年
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-3 md:p-4">
        {/* 热力图 */}
        <div className="w-full" ref={containerRef}>
          {/* 星期标签 - 重复显示以匹配所有列 */}
          <div className="flex mb-2">
            <div className="w-8 md:w-12"></div>
            <div className="flex gap-0.5 md:gap-1">
              {displayData.map((week, weekIndex) =>
                week.map((day, dayIndex) => {
                  // 只对有实际数据的周生成星期标签
                  if (day.week === -1) {
                    return (
                      <div
                        key={`${weekIndex}-${dayIndex}`}
                        style={{
                          width: `${squareSize}px`,
                          height: `${squareSize}px`
                        }}
                      />
                    );
                  }

                  return (
                    <div
                      key={`${weekIndex}-${dayIndex}`}
                      className="flex items-center justify-center text-white/50 font-medium"
                      style={{
                        width: `${squareSize}px`,
                        fontSize: isMobile ? '10px' : '12px' // 移动端更小字体
                      }}
                    >
                      {['日', '一', '二', '三', '四', '五', '六'][dayIndex]}
                    </div>
                  );
                })
              ).flat()}
            </div>
          </div>

          {/* 活动网格 */}
          <div className="flex">
            {/* 月份标签列 - 只在PC端全年模式显示，根据实际数据计算月份 */}
            {viewMode === 'full' && displayData.length > 0 && (
              <div className="hidden md:flex flex-col w-12 mr-2">
                {/* 根据第一周的数据计算月份 */}
                <div className="flex items-center justify-center" style={{ height: `${squareSize}px` }}>
                  <span className="text-xs text-white/40 font-medium">
                    {(() => {
                      // 获取第一周第一天的日期来计算月份
                      const firstWeekData = displayData[0];
                      if (firstWeekData?.[0]?.date) {
                        const date = new Date(firstWeekData[0].date);
                        return `${date.getMonth() + 1}月`;
                      }
                      return `${new Date().getMonth() + 1}月`;
                    })()}
                  </span>
                </div>
              </div>
            )}

            {/* 活动方块 */}
            <div className="flex gap-0.5 md:gap-1">
              {displayData.map((week, weekIndex) => (
                <div key={weekIndex} className="flex flex-col gap-0.5 md:gap-1">
                  {week.map((day, dayIndex) => {
                    // 如果是空数据（week === -1），不渲染方块
                    if (day.week === -1) {
                      return (
                        <div
                          key={dayIndex}
                          style={{
                            width: `${squareSize}px`,
                            height: `${squareSize}px`
                          }}
                        />
                      );
                    }

                    return (
                      <motion.div
                        key={dayIndex}
                        className="rounded-sm border border-white/10 transition-all hover:scale-110 hover:border-white/30 cursor-pointer flex items-center justify-center"
                        style={{
                          width: `${squareSize}px`,
                          height: `${squareSize}px`,
                          backgroundColor: `rgba(16, 185, 129, ${getActivityOpacity(day.count)})`
                        }}
                        title={`${day.date}: ${day.count}个任务`}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.1 + weekIndex * 0.01 + dayIndex * 0.001 }}
                        whileHover={{ scale: 1.1 }}
                      >
                        {day.count > 0 && squareSize >= 16 && (
                          <span className="text-xs text-white/80 font-medium">
                            {day.count}
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

        {/* 全年模式的分页控制 */}
        {viewMode === 'full' && maxPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-4">
            <Button
              variant="ghost"
              size="sm"
              className="p-1.5 text-white/60 hover:text-white"
              onClick={() => setCurrentWeek(Math.max(0, currentWeek - 1))}
              disabled={currentWeek === 0}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-white/60 text-sm">
              {currentWeek + 1} / {maxPages}
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="p-1.5 text-white/60 hover:text-white"
              onClick={() => setCurrentWeek(Math.min(maxPages - 1, currentWeek + 1))}
              disabled={currentWeek === maxPages - 1}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}

        {/* 图例 */}
        <div className="flex items-center justify-center gap-2 md:gap-3 mt-4 text-xs md:text-sm text-white/60">
          <span>少</span>
          <div className="flex gap-0.5 md:gap-1">
            {[0, 1, 2, 3, 4].map((level) => (
              <div
                key={level}
                className="w-3 h-3 md:w-4 md:h-4 rounded-sm border border-white/10"
                style={{
                  backgroundColor: `rgba(16, 185, 129, ${level > 0 ? 0.1 + (level / 4) * 0.4 : 0.05})`
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
