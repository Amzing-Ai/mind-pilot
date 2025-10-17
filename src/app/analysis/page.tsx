import { Suspense } from 'react';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import TaskAnalysisPage from '@/components/TaskAnalysisPage';
import { Skeleton } from '@/components/ui/skeleton';
import { getTaskStats, getActivityData, getLeaderboardData, getInsightsData } from '@/actions/analysis';

export default async function AnalysisPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/login');
  }

  // 在服务端获取所有数据
  const [statsResult, activityResult, leaderboardResult, insightsResult] = await Promise.all([
    getTaskStats(),
    getActivityData(),
    getLeaderboardData(),
    getInsightsData()
  ]);

  // 检查认证状态
  if (!statsResult.success || !activityResult.success || !leaderboardResult.success || !insightsResult.success ||
      !statsResult.data || !activityResult.data || !leaderboardResult.data || !insightsResult.data) {
    redirect('/login');
  }

  const stats = statsResult.data;
  const activityData = activityResult.data;
  const leaderboardData = leaderboardResult.data;
  const insightsData = insightsResult.data;

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <TaskAnalysisPage
        stats={stats}
        activityData={activityData}
        leaderboardData={leaderboardData}
        insightsData={insightsData}
      />
    </div>
  );
}

function AnalysisPageFallback() {
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 space-y-8">
        {/* Header Skeleton */}
        <div className="relative overflow-hidden rounded-3xl">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/90 via-blue-500/90 to-purple-500/90 backdrop-blur-xl" />
          <div className="relative z-10 p-8 md:p-10">
            <div className="flex items-center gap-3 mb-3">
              <Skeleton className="w-12 h-12 rounded-2xl bg-white/20" />
              <div className="space-y-2">
                <Skeleton className="h-6 w-32 bg-white/30" />
                <Skeleton className="h-4 w-64 bg-white/20" />
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="relative overflow-hidden rounded-3xl">
              <div className="absolute inset-0 bg-white/10 backdrop-blur-xl border border-white/20" />
              <div className="relative p-6">
                <div className="flex items-start justify-between mb-4">
                  <Skeleton className="w-12 h-12 rounded-2xl bg-white/20" />
                </div>
                <Skeleton className="h-4 w-24 bg-white/20 mb-2" />
                <Skeleton className="h-6 w-16 bg-white/30 mb-1" />
                <Skeleton className="h-3 w-20 bg-white/10" />
              </div>
            </div>
          ))}
        </div>

        {/* Activity Heatmap Skeleton */}
        <div className="rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 overflow-hidden">
          <div className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Skeleton className="w-8 h-8 rounded-xl bg-white/20" />
              <Skeleton className="h-6 w-32 bg-white/30" />
            </div>
            <Skeleton className="h-4 w-48 bg-white/20 mb-6" />
            <div className="flex gap-1">
              {Array.from({ length: 52 }).map((_, i) => (
                <div key={i} className="flex flex-col gap-1">
                  {Array.from({ length: 7 }).map((_, j) => (
                    <Skeleton key={j} className="w-3 h-3 rounded-sm bg-white/10" />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 24-Hour Activity Skeleton */}
        <div className="rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 overflow-hidden">
          <div className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Skeleton className="w-8 h-8 rounded-xl bg-white/20" />
              <Skeleton className="h-6 w-32 bg-white/30" />
            </div>
            <Skeleton className="h-4 w-48 bg-white/20 mb-6" />
            <div className="flex items-end gap-1 h-48">
              {Array.from({ length: 24 }).map((_, i) => (
                <Skeleton key={i} className="flex-1 bg-white/10 rounded-t-lg" style={{ height: `${Math.random() * 80 + 20}%` }} />
              ))}
            </div>
          </div>
        </div>

        {/* Leaderboard Skeleton */}
        <div className="rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 overflow-hidden">
          <div className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Skeleton className="w-8 h-8 rounded-xl bg-white/20" />
              <Skeleton className="h-6 w-32 bg-white/30" />
            </div>
            <Skeleton className="h-4 w-48 bg-white/20 mb-6" />
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-white/5">
                  <Skeleton className="w-12 h-12 rounded-xl bg-white/20" />
                  <Skeleton className="w-10 h-10 rounded-full bg-white/20" />
                  <Skeleton className="h-4 w-24 bg-white/20" />
                  <div className="flex-1" />
                  <Skeleton className="h-4 w-16 bg-white/20" />
                  <Skeleton className="h-4 w-16 bg-white/20" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}