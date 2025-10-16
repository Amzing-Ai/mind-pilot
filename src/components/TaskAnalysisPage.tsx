'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import MobileAnalysisPage from './MobileAnalysisPage';
import ActivityHeatmap from './ActivityHeatmap';
import HourlyActivityChart from './HourlyActivityChart';
import {
  TrendingUp,
  Award,
  Target,
  Zap,
  Calendar,
  CheckCircle2,
  Trophy,
  Clock,
  Flame
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface TaskAnalysisPageProps {
  stats: any;
  activityData: any[];
  leaderboardData: any[];
  insightsData: any;
}

// 获取活动热力的颜色

export default function TaskAnalysisPage({
  stats,
  activityData,
  leaderboardData,
  insightsData
}: TaskAnalysisPageProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // 移动端使用专用布局
  if (isMobile) {
    return (
      <MobileAnalysisPage
        stats={stats}
        activityData={activityData}
        leaderboardData={leaderboardData}
        insightsData={insightsData}
      />
    );
  }


  const statsCards = [
    {
      title: '累计创建任务',
      value: `${stats.totalTasks}`,
      subtitle: '全年总计',
      icon: CheckCircle2,
      color: 'from-cyan-400 to-blue-500',
    },
    {
      title: '当前连续天数',
      value: `${stats.currentStreak}天`,
      subtitle: `最长 ${stats.longestStreak}天`,
      icon: Flame,
      color: 'from-orange-400 to-red-500',
    },
    {
      title: '最佳完成时段',
      value: `${stats.bestHour}:00`,
      subtitle: `完成${stats.bestHourCount}个任务`,
      icon: Clock,
      color: 'from-purple-500 to-pink-500',
    },
    {
      title: '全球排名',
      value: `#${stats.globalRank}`,
      subtitle: `前${stats.rankPercentile}%用户`,
      icon: Trophy,
      color: 'from-amber-400 to-orange-500',
    },
  ];

  // 计算月份标签

  const insights = [
    {
      icon: TrendingUp,
      title: '持续进步',
      description: `您本周完成了${insightsData.thisWeekTasks}个任务，比上周${insightsData.improvementPercent >= 0 ? '提高了' : '下降了'}${Math.abs(insightsData.improvementPercent)}%，保持这个势头！`,
      gradient: 'from-cyan-400 to-blue-500',
    },
    {
      icon: Target,
      title: '目标达成',
      description: `已完成本月目标的${insightsData.goalProgress}%，还有${insightsData.daysRemaining}天时间，加油冲刺！`,
      gradient: 'from-purple-400 to-pink-500',
    },
    {
      icon: Award,
      title: '超越自我',
      description: `您已超越了${insightsData.surpassPercent}%的用户，正在向前3%的精英行列迈进！`,
      gradient: 'from-amber-400 to-orange-500',
    },
  ];

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="w-full max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8 py-2 sm:py-4 md:py-6 lg:py-8 space-y-3 sm:space-y-4 md:space-y-6 lg:space-y-8">
        {/* Header */}
        <motion.div
          className="relative overflow-hidden rounded-3xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/90 via-blue-500/90 to-purple-500/90 backdrop-blur-xl" />
          <div className="absolute inset-0">
            <div className="absolute top-0 left-0 w-64 h-64 bg-gradient-to-br from-white/20 to-transparent rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-br from-purple-500/30 to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          </div>

          <div className="relative z-10 p-3 sm:p-4 md:p-6 lg:p-8 xl:p-10">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
              <motion.div
                className="p-2 sm:p-3 rounded-xl sm:rounded-2xl bg-white/20 backdrop-blur-sm flex-shrink-0"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.2, duration: 0.6, type: "spring" }}
              >
                <Award className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" />
              </motion.div>
              <div className="flex-1 min-w-0">
                <motion.h2
                  className="text-white mb-1 text-base sm:text-lg md:text-xl lg:text-2xl"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                >
                  数据分析
                </motion.h2>
                <motion.p
                  className="text-white/80 text-xs sm:text-sm md:text-base"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                >
                  深度洞察您的任务完成习惯与效率表现
                </motion.p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
          {statsCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={index}
                className="group relative overflow-hidden rounded-3xl transition-all duration-500 hover:scale-105"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.1, duration: 0.6 }}
                whileHover={{ scale: 1.05 }}
              >
                <div className="absolute inset-0 bg-white/10 backdrop-blur-xl border border-white/20" />
                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${stat.color} opacity-20 rounded-full blur-3xl group-hover:opacity-30 transition-opacity`} />

                <div className="relative p-4 sm:p-6">
                  <div className="flex items-start justify-between mb-3 sm:mb-4">
                    <motion.div
                      className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-2xl shadow-current/50`}
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ delay: 0.2 + index * 0.1, duration: 0.6, type: "spring" }}
                    >
                      <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </motion.div>
                  </div>
                  <p className="text-white/70 mb-1 text-xs sm:text-sm">{stat.title}</p>
                  <motion.h3
                    className="text-white mb-1 text-lg sm:text-xl md:text-2xl"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3 + index * 0.1, type: "spring" }}
                  >
                    {stat.value}
                  </motion.h3>
                  <p className="text-white/50 text-xs">{stat.subtitle}</p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Activity Heatmap - 使用新的移动优先组件 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          <ActivityHeatmap activityData={activityData} />
        </motion.div>

        {/* 24-Hour Activity - 使用新的移动优先组件 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
        >
          <HourlyActivityChart hourlyDistribution={stats.hourlyDistribution} />
        </motion.div>

        {/* Leaderboard */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.6 }}
        >
          <Card className="rounded-3xl bg-white/10 backdrop-blur-xl border-white/20 overflow-hidden">
            <div className="absolute top-1/2 left-1/2 w-60 h-60 bg-gradient-to-br from-amber-400/20 to-orange-400/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
            <CardHeader className="relative p-3 sm:p-4 md:p-6">
              <CardTitle className="flex flex-col sm:flex-row items-start sm:items-center gap-2 text-white">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-gradient-to-br from-amber-400 to-orange-500">
                    <Trophy className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                  </div>
                  <span className="text-sm sm:text-lg md:text-xl">全球排行榜</span>
                </div>
              </CardTitle>
              <p className="text-white/60 text-xs sm:text-sm mt-1 sm:mt-2">与全球用户一较高下</p>
            </CardHeader>
            <CardContent className="relative p-3 sm:p-4 md:p-6 space-y-1.5 sm:space-y-2 md:space-y-3">
              {leaderboardData.map((user, index) => {
                const isTop3 = user.rank <= 3;
                const medalColors = ['from-amber-400 to-amber-600', 'from-slate-300 to-slate-500', 'from-orange-600 to-orange-800'];

                return (
                  <motion.div
                    key={index}
                    className={`group relative overflow-hidden rounded-2xl transition-all duration-300 mx-1 ${
                      user.isCurrentUser
                        ? 'bg-gradient-to-r from-cyan-500/30 to-blue-500/30 border-2 border-cyan-400/50 scale-105'
                        : 'bg-white/5 border border-white/10 hover:bg-white/10'
                    }`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.2 + index * 0.1, duration: 0.6 }}
                    whileHover={{ scale: user.isCurrentUser ? 1.05 : 1.02 }}
                  >
                  <div className="relative p-2 sm:p-3 md:p-4 flex items-center gap-1.5 sm:gap-2 md:gap-4">
                    {/* Rank */}
                    <div className={`w-6 h-6 sm:w-8 sm:h-8 md:w-12 md:h-12 rounded-md sm:rounded-lg md:rounded-xl flex items-center justify-center shrink-0 ${
                      isTop3
                        ? `bg-gradient-to-br ${medalColors[user.rank - 1]} shadow-lg`
                        : 'bg-white/10'
                    }`}>
                      {isTop3 ? (
                        <Trophy className="w-3 h-3 sm:w-4 sm:h-4 md:w-6 md:h-6 text-white" />
                      ) : (
                        <span className="text-white text-xs sm:text-sm md:text-base">{user.rank}</span>
                      )}
                    </div>

                    {/* Avatar & Name */}
                    <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3 flex-1 min-w-0">
                      <Avatar className="h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10 border border-white/20">
                        <AvatarImage src={user.avatar} />
                        <AvatarFallback className="bg-gradient-to-br from-cyan-400 to-blue-500 text-white text-xs sm:text-sm">
                          {user.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-white truncate text-xs sm:text-sm md:text-base">{user.name}</h4>
                        {user.isCurrentUser && (
                          <span className="text-xs text-cyan-300">（你）</span>
                        )}
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-2 sm:gap-3 md:gap-6">
                      <div className="text-right">
                        <div className="text-white/50 text-xs">任务</div>
                        <div className="text-white text-xs sm:text-sm md:text-base">{user.tasks}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-white/50 text-xs">天数</div>
                        <div className="flex items-center gap-0.5 sm:gap-1 text-orange-400">
                          <Flame className="w-2 h-2 sm:w-3 sm:h-3 md:w-4 md:h-4" />
                          <span className="text-xs sm:text-sm md:text-base">{user.streak}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                    {/* Highlight for current user */}
                    {user.isCurrentUser && (
                      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 pointer-events-none" />
                    )}
                  </motion.div>
                );
              })}
            </CardContent>
          </Card>
        </motion.div>

        {/* Insights */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 md:gap-4 lg:gap-6">
          {insights.map((insight, index) => {
            const Icon = insight.icon;
            return (
              <motion.div
                key={index}
                className="group relative overflow-hidden rounded-3xl transition-all duration-500 hover:scale-105"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.4 + index * 0.1, duration: 0.6 }}
                whileHover={{ scale: 1.05 }}
              >
                <div className="absolute inset-0 bg-white/10 backdrop-blur-xl border border-white/20" />
                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${insight.gradient} opacity-20 rounded-full blur-3xl group-hover:opacity-30 transition-opacity`} />

                <div className="relative p-3 sm:p-4 md:p-6">
                  <motion.div
                    className={`w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-lg sm:rounded-xl md:rounded-2xl bg-gradient-to-br ${insight.gradient} flex items-center justify-center mb-2 sm:mb-3 md:mb-4 shadow-2xl shadow-current/50`}
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 1.5 + index * 0.1, duration: 0.6, type: "spring" }}
                  >
                    <Icon className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" />
                  </motion.div>
                  <h4 className="text-white mb-1 sm:mb-2 text-xs sm:text-sm md:text-base">{insight.title}</h4>
                  <p className="text-white/70 text-xs sm:text-sm leading-relaxed">{insight.description}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
