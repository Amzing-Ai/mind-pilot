import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getTaskStats, getTasksWithPriority } from "@/actions/taskDashboard";
import TaskStatsOverview from "@/components/TaskStatsOverview";
import TaskList from "@/components/TaskList";

// 定义任务类型
type TaskWithList = {
  id: number;
  content: string;
  status: string;
  priority: string;
  expiresAt: Date | null;
  createdAt: Date;
  userId: string;
  done: boolean;
  startTime: Date | null;
  ListId: number;
  list: {
    name: string;
    color: string;
  };
};

async function TaskDashboard() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const [statsResult, tasksResult] = await Promise.all([
    getTaskStats(),
    getTasksWithPriority(1, 10)
  ]);

  // 检查认证状态
  if (!statsResult.success || !tasksResult.success || !statsResult.data || !tasksResult.data) {
    redirect("/login");
  }

  const stats = statsResult.data;
  const tasks = tasksResult.data;

  return (
    <div className="min-h-full w-full bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
      <div className="w-full max-w-none px-4 md:px-6 lg:px-8 py-6">
        {/* Task Stats Overview */}
        <TaskStatsOverview stats={stats} />

        {/* Task List */}
        <TaskList
          initialTasks={Array.isArray(tasks) ? tasks as TaskWithList[] : []}
          initialHasMore={Array.isArray(tasks) ? tasks.length === 10 : false}
        />
      </div>
    </div>
  );
}

function TaskDashboardFallback() {
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
      <div className="w-full px-4 py-8">
        {/* Header Skeleton */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-full bg-gray-600/50" />
              <Skeleton className="h-8 w-48 bg-gray-600/50" />
            </div>
            <Skeleton className="h-8 w-8 rounded-full bg-gray-600/50" />
          </div>
          <Skeleton className="h-4 w-64 bg-gray-600/50" />
        </div>

        {/* Stats Grid Skeleton */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 bg-gray-600/40 rounded-lg" />
          ))}
        </div>

        {/* Task List Header Skeleton */}
        <div className="flex items-center justify-between mb-6">
          <Skeleton className="h-6 w-24 bg-gray-600/50" />
          <Skeleton className="h-8 w-16 bg-gray-600/50 rounded" />
        </div>

        {/* Task Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-48 bg-gray-600/40 rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<TaskDashboardFallback />}>
      <TaskDashboard />
    </Suspense>
  );
}
