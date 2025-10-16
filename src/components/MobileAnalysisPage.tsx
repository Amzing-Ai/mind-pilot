'use client';

import { motion } from 'framer-motion';
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

interface MobileAnalysisPageProps {
  stats: any;
  activityData: any[];
  leaderboardData: any[];
  insightsData: any;
}

export default function MobileAnalysisPage({
  stats,
  activityData,
  leaderboardData,
  insightsData
}: MobileAnalysisPageProps) {

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
      <div className="w-full px-2 py-3 space-y-3">
        {/* Header - 移动端优化 */}
        <motion.div
          className="relative overflow-hidden rounded-2xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/90 via-blue-500/90 to-purple-500/90 backdrop-blur-xl" />
          <div className="relative z-10 p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 rounded-xl bg-white/20 backdrop-blur-sm">
                <Award className="w-4 h-4 text-white" />
              </div>
              <div>
                <h2 className="text-white text-base">数据分析</h2>
                <p className="text-white/80 text-xs">深度洞察您的任务完成习惯与效率表现</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid - 移动端2列布局，优化显示 */}
        <div className="grid grid-cols-2 gap-2">
          {statsCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={index}
                className="group relative overflow-hidden rounded-2xl transition-all duration-500"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.1, duration: 0.6 }}
              >
                <div className="absolute inset-0 bg-white/10 backdrop-blur-xl border border-white/20" />
                <div className="relative p-3 h-full flex flex-col">
                  <div className="flex items-center justify-between mb-2">
                    <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg`}>
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  <div className="flex-1 flex flex-col justify-center">
                    <p className="text-white/70 mb-1 text-xs leading-tight">{stat.title}</p>
                    <h3 className="text-white mb-1 text-base font-bold leading-tight">{stat.value}</h3>
                    <p className="text-white/50 text-xs leading-tight">{stat.subtitle}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* 活动热力图 - 使用新的移动优先组件 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          <ActivityHeatmap activityData={activityData} />
        </motion.div>

        {/* 24小时活动分布 - 使用新的移动优先组件 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
        >
          <HourlyActivityChart hourlyDistribution={stats.hourlyDistribution} />
        </motion.div>

        {/* 简化的排行榜 - 只显示前5名 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.6 }}
        >
          <Card className="rounded-2xl bg-white/10 backdrop-blur-xl border-white/20 overflow-hidden">
            <CardHeader className="relative p-3">
              <CardTitle className="flex items-center gap-2 text-white">
                <div className="p-1.5 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500">
                  <Trophy className="w-3 h-3 text-white" />
                </div>
                <span className="text-sm">全球排行榜</span>
              </CardTitle>
              <p className="text-white/60 text-xs mt-1">与全球用户一较高下</p>
            </CardHeader>
            <CardContent className="relative p-3 space-y-1.5">
              {leaderboardData.slice(0, 5).map((user, index) => {
                const isTop3 = user.rank <= 3;
                const medalColors = ['from-amber-400 to-amber-600', 'from-slate-300 to-slate-500', 'from-orange-600 to-orange-800'];

                return (
                  <div
                    key={index}
                    className={`group relative overflow-hidden rounded-xl transition-all duration-300 ${
                      user.isCurrentUser
                        ? 'bg-gradient-to-r from-cyan-500/30 to-blue-500/30 border border-cyan-400/50'
                        : 'bg-white/5 border border-white/10'
                    }`}
                  >
                    <div className="relative p-3 flex items-center gap-2">
                      {/* Rank */}
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                        isTop3
                          ? `bg-gradient-to-br ${medalColors[user.rank - 1]} shadow-lg`
                          : 'bg-white/10'
                      }`}>
                        {isTop3 ? (
                          <Trophy className="w-4 h-4 text-white" />
                        ) : (
                          <span className="text-white text-sm font-bold">{user.rank}</span>
                        )}
                      </div>

                      {/* Avatar & Name */}
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <Avatar className="h-8 w-8 border-2 border-white/20">
                          <AvatarImage src={user.avatar} />
                          <AvatarFallback className="bg-gradient-to-br from-cyan-400 to-blue-500 text-white text-sm font-bold">
                            {user.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-white truncate text-sm font-medium">{user.name}</h4>
                          {user.isCurrentUser && (
                            <span className="text-xs text-cyan-300 font-medium">（你）</span>
                          )}
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className="text-white/50 text-xs">任务</div>
                          <div className="text-white text-sm font-bold">{user.tasks}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-white/50 text-xs">天数</div>
                          <div className="flex items-center gap-1 text-orange-400">
                            <Flame className="w-3 h-3" />
                            <span className="text-sm font-bold">{user.streak}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Highlight for current user */}
                    {user.isCurrentUser && (
                      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 pointer-events-none" />
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </motion.div>

        {/* 简化的洞察卡片 - 移动端优化 */}
        <div className="space-y-2">
          {insights.map((insight, index) => {
            const Icon = insight.icon;
            return (
              <motion.div
                key={index}
                className="group relative overflow-hidden rounded-2xl transition-all duration-500"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.4 + index * 0.1, duration: 0.6 }}
              >
                <div className="absolute inset-0 bg-white/10 backdrop-blur-xl border border-white/20" />
                <div className="relative p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${insight.gradient} flex items-center justify-center shadow-lg`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <h4 className="text-white text-base font-semibold">{insight.title}</h4>
                  </div>
                  <p className="text-white/70 text-sm leading-relaxed">{insight.description}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
