"use client";

import { useState, useEffect, useCallback } from "react";
import { getTasksWithPriority, updateTaskStatus } from "@/actions/taskDashboard";
import TaskCard from "./TaskCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { RefreshCw, List, Grid3X3 } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

interface Task {
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
}

interface TaskListProps {
  initialTasks: Task[];
  initialHasMore: boolean;
}

export default function TaskList({ initialTasks, initialHasMore }: TaskListProps) {
  // 确保初始任务没有重复的ID
  const uniqueInitialTasks = initialTasks.filter((task, index, self) =>
    self.findIndex(t => t.id === task.id) === index
  );
  const [tasks, setTasks] = useState<Task[]>(uniqueInitialTasks);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [page, setPage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState<'card' | 'list'>('card');
  const [updatingTasks, setUpdatingTasks] = useState<Set<number>>(new Set());

  const handleTaskStatusUpdate = async (taskId: number, newStatus: string) => {
    // 添加任务到更新中状态
    setUpdatingTasks(prev => new Set(prev).add(taskId));

    try {
      await updateTaskStatus(taskId, newStatus);

      // 显示成功提示
      const statusLabels = {
        'pending': '待处理',
        'in_progress': '进行中',
        'paused': '已暂停',
        'completed': '已完成'
      };

      toast.success(`任务状态已更新为${statusLabels[newStatus as keyof typeof statusLabels]}`);

      // 如果任务完成，立即从列表中移除
      if (newStatus === 'completed') {
        setTasks(prev => prev.filter(task => task.id !== taskId));
      } else {
        // 其他状态更新，更新本地状态
        setTasks(prev => prev.map(task =>
          task.id === taskId
            ? { ...task, status: newStatus, done: newStatus === 'completed' }
            : task
        ));
      }
    } catch (error) {
      console.error('更新任务状态失败:', error);
      toast.error('更新任务状态失败，请稍后重试');
    } finally {
      // 从更新中状态移除
      setUpdatingTasks(prev => {
        const newSet = new Set(prev);
        newSet.delete(taskId);
        return newSet;
      });
    }
  };

  const loadMoreTasks = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    try {
      // 添加最小加载时间，确保用户能看到加载动画
      const [newTasks] = await Promise.all([
        getTasksWithPriority(page + 1, 10),
        new Promise(resolve => setTimeout(resolve, 1200)) // 减少到1200ms加载时间
      ]);

      // 立即更新数据，不添加额外延迟，并确保没有重复的ID
      setTasks(prev => {
        const existingIds = new Set(prev.map(task => task.id));
        const uniqueNewTasks = (newTasks as any).filter((task: any) => !existingIds.has(task.id));
        return [...prev, ...uniqueNewTasks];
      });
      setPage(prev => prev + 1);
      setHasMore(newTasks.length === 10);
    } catch (error) {
      console.error("加载更多任务失败:", error);
    } finally {
      // 添加短暂延迟确保Skeleton完全消失后再隐藏loading状态
      setTimeout(() => {
        setLoading(false);
      }, 100);
    }
  }, [loading, hasMore, page]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      // 添加最小加载时间，确保用户能看到刷新动画
      const [newTasks] = await Promise.all([
        getTasksWithPriority(1, 10),
        new Promise(resolve => setTimeout(resolve, 600)) // 最小600ms刷新时间
      ]);
      setTasks(newTasks as any);
      setPage(1);
      setHasMore(newTasks.length === 10);
    } catch (error) {
      console.error("刷新任务失败:", error);
    } finally {
      setRefreshing(false);
    }
  };

  // 滚动加载
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop >=
        document.documentElement.offsetHeight - 1000
      ) {
        loadMoreTasks();
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [loadMoreTasks]);

  if (tasks.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 mb-4">
          <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-300 mb-2">暂无任务</h3>
        <p className="text-gray-400 text-sm">开始创建您的第一个任务清单吧！</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Header */}
      <motion.div
        className="flex items-center justify-between mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.8 }}
      >
        <h2 className="text-xl font-semibold text-white">任务列表</h2>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setViewMode(viewMode === 'card' ? 'list' : 'card')}
            className="text-gray-300 border-gray-600 hover:bg-gray-700"
          >
            {viewMode === 'card' ? (
              <>
                <List className="w-4 h-4 mr-2" />
                列表
              </>
            ) : (
              <>
                <Grid3X3 className="w-4 h-4 mr-2" />
                卡片
              </>
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
            className="text-gray-300 border-gray-600 hover:bg-gray-700"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            刷新
          </Button>
        </div>
      </motion.div>

      {/* Task Display */}
      {viewMode === 'card' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tasks.map((task, index) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: index < 6 ? 0.9 + index * 0.1 : 0.1, // 初始任务有延迟，新加载的任务快速出现
                duration: 0.5
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <TaskCard task={task} onStatusUpdate={handleTaskStatusUpdate} />
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {tasks.map((task, index) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index < 6 ? 0.9 + index * 0.1 : 0.1 }}
              className={`bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg p-2.5 hover:bg-white/20 transition-all duration-300 ${
                updatingTasks.has(task.id) ? 'opacity-75' : ''
              }`}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0 pr-3">
                  <h3 className="text-white font-medium text-sm leading-relaxed break-words">
                    {task.content}
                  </h3>
                </div>
                <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                  <div className="flex items-center gap-1.5 mb-2">
                    {/* 待处理状态：显示开始按钮 */}
                    {task.status === 'pending' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleTaskStatusUpdate(task.id, 'in_progress')}
                        disabled={updatingTasks.has(task.id)}
                        className="text-xs px-2 py-1 h-7 border-white/30 text-white hover:bg-white/10 hover:border-white/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {updatingTasks.has(task.id) ? '更新中...' : '开始'}
                      </Button>
                    )}

                    {/* 进行中状态：显示暂停按钮 */}
                    {task.status === 'in_progress' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleTaskStatusUpdate(task.id, 'paused')}
                        disabled={updatingTasks.has(task.id)}
                        className="text-xs px-2 py-1 h-7 border-orange-300 text-orange-300 hover:bg-orange-500/20 hover:border-orange-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {updatingTasks.has(task.id) ? '更新中...' : '暂停'}
                      </Button>
                    )}

                    {/* 暂停状态：显示继续按钮 */}
                    {task.status === 'paused' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleTaskStatusUpdate(task.id, 'in_progress')}
                        disabled={updatingTasks.has(task.id)}
                        className="text-xs px-2 py-1 h-7 border-blue-300 text-blue-300 hover:bg-blue-500/20 hover:border-blue-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {updatingTasks.has(task.id) ? '更新中...' : '继续'}
                      </Button>
                    )}

                    {/* 非完成状态：显示完成按钮 */}
                    {task.status !== 'completed' && (
                      <Button
                        size="sm"
                        onClick={() => handleTaskStatusUpdate(task.id, 'completed')}
                        disabled={updatingTasks.has(task.id)}
                        className="text-xs px-2 py-1 h-7 bg-green-500 hover:bg-green-600 text-white hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {updatingTasks.has(task.id) ? '更新中...' : '完成'}
                      </Button>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs">
                    <span className={`font-semibold ${
                      task.priority === 'urgent' ? 'text-red-400' :
                      task.priority === 'high' ? 'text-orange-400' :
                      task.priority === 'medium' ? 'text-blue-400' :
                      'text-gray-400'
                    }`}>
                      {task.priority === 'urgent' ? '紧急' :
                       task.priority === 'high' ? '高' :
                       task.priority === 'medium' ? '中' : '低'}
                    </span>
                    {task.expiresAt && (
                      <>
                        <span className="text-gray-500">|</span>
                        <span className="text-gray-400">
                          {new Date(task.expiresAt).toLocaleDateString('zh-CN', {
                            month: '2-digit',
                            day: '2-digit'
                          })}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Loading States */}
      {loading && (
        viewMode === 'card' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index}>
                <Skeleton className="h-48 bg-gray-600/40 rounded-lg" />
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-2 mt-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg p-2.5">
                <div className="flex items-start justify-between">
                  <div className="flex-1 pr-3">
                    <Skeleton className="h-4 w-3/4 bg-gray-600/40" />
                  </div>
                  <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                    <div className="flex items-center gap-1.5 mb-2">
                      <Skeleton className="h-6 w-12 bg-gray-600/40" />
                      <Skeleton className="h-6 w-12 bg-gray-600/40" />
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Skeleton className="h-3 w-6 bg-gray-600/40" />
                      <Skeleton className="h-3 w-1 bg-gray-600/40" />
                      <Skeleton className="h-3 w-5 bg-gray-600/40" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* Load More Button */}
      {hasMore && !loading && (
        <div className="text-center mt-8">
          <Button
            variant="outline"
            onClick={loadMoreTasks}
            className="text-gray-300 border-gray-600 hover:bg-gray-700"
          >
            加载更多任务
          </Button>
        </div>
      )}

      {/* No More Tasks */}
      {!hasMore && tasks.length > 0 && (
        <div className="text-center mt-8">
          <p className="text-gray-400 text-sm">已显示所有任务</p>
        </div>
      )}
    </div>
  );
}
