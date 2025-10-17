"use client";

import { useState, useEffect, useCallback } from "react";
import { getTasksWithPriority, getTasksWithSorting, updateTaskStatus } from "@/actions/taskDashboard";
import TaskCard from "./TaskCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { RefreshCw, List, Grid3X3, ArrowUpDown } from "lucide-react";
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

type SortOption =
  | 'priority'
  | 'time_earliest'
  | 'time_latest'
  | 'duration_shortest'
  | 'duration_longest';

export default function TaskList({ initialTasks, initialHasMore }: TaskListProps) {
  // 确保 initialTasks 是数组
  const safeInitialTasks = Array.isArray(initialTasks) ? initialTasks : [];

  // 确保初始任务没有重复的ID
  const uniqueInitialTasks = safeInitialTasks.filter((task, index, self) =>
    self.findIndex(t => t.id === task.id) === index
  );
  const [tasks, setTasks] = useState<Task[]>(uniqueInitialTasks);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [page, setPage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState<'card' | 'list'>('card');
  const [updatingTasks, setUpdatingTasks] = useState<Set<number>>(new Set());
  const [sortOption, setSortOption] = useState<SortOption>('priority');
  const [showSortModal, setShowSortModal] = useState(false);
  const [isSorting, setIsSorting] = useState(false);

  // 从本地存储加载排序设置并重新查询数据
  useEffect(() => {
    const savedSortOption = localStorage.getItem('taskSortOption') as SortOption;
    if (savedSortOption && savedSortOption !== sortOption) {
      setSortOption(savedSortOption);
      // 使用缓存的排序配置重新查询数据，但不显示toast
      refreshTasksWithSort(savedSortOption, false);
    }
  }, []);

  // 保存排序设置到本地存储并重新查询数据
  const handleSortChange = async (newSortOption: SortOption) => {
    setSortOption(newSortOption);
    localStorage.setItem('taskSortOption', newSortOption);
    setShowSortModal(false);

    // 设置排序状态并重新查询数据
    setIsSorting(true);
    await refreshTasksWithSort(newSortOption);
    setIsSorting(false);
  };

  // 使用新的排序条件重新查询数据
  const refreshTasksWithSort = async (sortBy: SortOption, showToast: boolean = true) => {
    // 不设置loading状态，避免清空列表
    try {
      const newTasksResult = await getTasksWithSorting(1, 10, sortBy);
      if (newTasksResult.success && newTasksResult.data) {
        setTasks(newTasksResult.data as any);
        setPage(1);
        setHasMore(newTasksResult.data.length === 10);
      }

      // 只在需要时显示成功提示
      if (showToast) {
        const sortLabels = {
          'priority': '按紧急程度',
          'time_earliest': '按时间（更早）',
          'time_latest': '按时间（更近）',
          'duration_shortest': '按任务所需时间（最少）',
          'duration_longest': '按任务所需时间（最多）'
        };

      toast.success(`已切换到${sortLabels[sortBy]}排序`, {
        duration: 1500,
        style: {
          background: 'rgba(0, 0, 0, 0.8)',
          border: '1px solid rgba(34, 197, 94, 0.5)',
          color: '#22c55e',
          backdropFilter: 'blur(10px)',
          fontSize: '14px',
          fontWeight: '700',
          boxShadow: '0 4px 16px rgba(34, 197, 94, 0.3)'
        }
      });
      }
    } catch (error) {
      console.error("重新查询任务失败:", error);
      if (showToast) {
      toast.error("排序查询失败，请稍后重试", {
        duration: 3000,
        style: {
          background: 'rgba(0, 0, 0, 0.8)',
          border: '1px solid rgba(239, 68, 68, 0.5)',
          color: '#ef4444',
          backdropFilter: 'blur(10px)',
          fontSize: '14px',
          fontWeight: '700',
          boxShadow: '0 4px 16px rgba(239, 68, 68, 0.3)'
        }
      });
      }
    }
  };

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

      // 使用更简约的科技风格提示
      if (newStatus === 'completed') {
        toast.success('✓ 任务已完成', {
          duration: 2000,
          style: {
            background: 'rgba(0, 0, 0, 0.8)',
            border: '1px solid rgba(34, 197, 94, 0.5)',
            color: '#22c55e',
            backdropFilter: 'blur(10px)',
            fontSize: '14px',
            fontWeight: '700',
            boxShadow: '0 4px 16px rgba(34, 197, 94, 0.3)'
          }
        });
      } else {
        toast.success(`任务状态已更新为${statusLabels[newStatus as keyof typeof statusLabels]}`, {
          duration: 2000,
          style: {
            background: 'rgba(0, 0, 0, 0.8)',
            border: '1px solid rgba(59, 130, 246, 0.5)',
            color: '#3b82f6',
            backdropFilter: 'blur(10px)',
            fontSize: '14px',
            fontWeight: '700',
            boxShadow: '0 4px 16px rgba(59, 130, 246, 0.3)'
          }
        });
      }

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
      toast.error('更新任务状态失败，请稍后重试', {
        duration: 3000,
        style: {
          background: 'rgba(0, 0, 0, 0.8)',
          border: '1px solid rgba(239, 68, 68, 0.5)',
          color: '#ef4444',
          backdropFilter: 'blur(10px)',
          fontSize: '14px',
          fontWeight: '700',
          boxShadow: '0 4px 16px rgba(239, 68, 68, 0.3)'
        }
      });
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
      const [newTasksResult] = await Promise.all([
        getTasksWithSorting(page + 1, 10, sortOption),
        new Promise(resolve => setTimeout(resolve, 1200)) // 减少到1200ms加载时间
      ]);

      // 立即更新数据，不添加额外延迟，并确保没有重复的ID
      if (newTasksResult.success && newTasksResult.data) {
        setTasks(prev => {
          const existingIds = new Set(prev.map(task => task.id));
          const uniqueNewTasks = (newTasksResult.data as any).filter((task: any) => !existingIds.has(task.id));
          return [...prev, ...uniqueNewTasks];
        });
        setPage(prev => prev + 1);
        setHasMore(newTasksResult.data.length === 10);
      }
    } catch (error) {
      console.error("加载更多任务失败:", error);
    } finally {
      // 添加短暂延迟确保Skeleton完全消失后再隐藏loading状态
      setTimeout(() => {
        setLoading(false);
      }, 100);
    }
  }, [loading, hasMore, page, sortOption]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      // 添加最小加载时间，确保用户能看到刷新动画
      const [newTasksResult] = await Promise.all([
        getTasksWithSorting(1, 10, sortOption),
        new Promise(resolve => setTimeout(resolve, 600)) // 最小600ms刷新时间
      ]);
      if (newTasksResult.success && newTasksResult.data) {
        setTasks(newTasksResult.data as any);
        setPage(1);
        setHasMore(newTasksResult.data.length === 10);
      }
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

  if (!Array.isArray(tasks) || tasks.length === 0) {
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
            onClick={() => setShowSortModal(true)}
            disabled={isSorting}
            className="bg-transparent text-gray-300 border-gray-600 hover:bg-gray-700 hover:text-white p-2 relative"
            title="排序任务"
          >
            <ArrowUpDown className={`w-4 h-4 ${isSorting ? 'animate-pulse' : ''}`} />
            {isSorting && (
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full animate-ping"></div>
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setViewMode(viewMode === 'card' ? 'list' : 'card')}
            className="bg-transparent text-gray-300 border-gray-600 hover:bg-gray-700 hover:text-white p-2"
            title={viewMode === 'card' ? '切换到列表视图' : '切换到卡片视图'}
          >
            {viewMode === 'card' ? (
              <List className="w-4 h-4" />
            ) : (
              <Grid3X3 className="w-4 h-4" />
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
            className="bg-transparent text-gray-300 border-gray-600 hover:bg-gray-700 hover:text-white p-2"
            title="刷新任务列表"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </motion.div>

      {/* 排序状态提示 - 使用骨架屏 */}
      {isSorting && (
        <div className="mb-4">
          {viewMode === 'card' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="relative">
                  <Skeleton className="h-48 bg-white/10 rounded-lg animate-pulse" />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="relative">
                  <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg p-2.5">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 pr-3">
                        <Skeleton className="h-4 w-3/4 bg-white/20 mb-2" />
                        <Skeleton className="h-3 w-1/2 bg-white/15" />
                      </div>
                      <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                        <div className="flex items-center gap-1.5 mb-2">
                          <Skeleton className="h-6 w-12 bg-white/20" />
                          <Skeleton className="h-6 w-12 bg-white/20" />
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Skeleton className="h-3 w-6 bg-white/15" />
                          <Skeleton className="h-3 w-1 bg-white/15" />
                          <Skeleton className="h-3 w-5 bg-white/15" />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer rounded-lg"></div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Task Display */}
      {viewMode === 'card' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.isArray(tasks) && tasks.map((task, index) => (
            <div key={task.id}>
              <TaskCard task={task} onStatusUpdate={handleTaskStatusUpdate} />
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {Array.isArray(tasks) && tasks.map((task, index) => (
            <div
              key={task.id}
              className={`bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg p-2.5 hover:bg-white/20 transition-all duration-300 ${
                updatingTasks.has(task.id) ? 'opacity-75' : ''
              }`}
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
                        className="bg-transparent text-xs px-2 py-1 h-7 border-white/30 text-white hover:bg-white/10 hover:border-white/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
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
                        className="bg-transparent text-xs px-2 py-1 h-7 border-orange-300 text-orange-300 hover:bg-orange-500/20 hover:border-orange-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
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
                        className="bg-transparent text-xs px-2 py-1 h-7 border-blue-300 text-blue-300 hover:bg-blue-500/20 hover:border-blue-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
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
            </div>
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
            className="bg-transparent text-gray-300 border-gray-600 hover:bg-gray-700 hover:text-white"
          >
            加载更多任务
          </Button>
        </div>
      )}

      {/* No More Tasks */}
      {!hasMore && Array.isArray(tasks) && tasks.length > 0 && (
        <div className="text-center mt-8">
          <p className="text-gray-400 text-sm">已显示所有任务</p>
        </div>
      )}

      {/* Sort Modal */}
      {showSortModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 w-full max-w-md"
          >
            <h3 className="text-white text-lg font-semibold mb-4">排序任务</h3>
            <div className="space-y-3">
              {[
                { value: 'priority', label: '按紧急程度', icon: '🔥' },
                { value: 'time_earliest', label: '按时间（更早）', icon: '⏰' },
                { value: 'time_latest', label: '按时间（更近）', icon: '⏰' },
                { value: 'duration_shortest', label: '按任务所需时间（最少）', icon: '⚡' },
                { value: 'duration_longest', label: '按任务所需时间（最多）', icon: '⏳' }
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleSortChange(option.value as SortOption)}
                  disabled={isSorting}
                  className={`w-full text-left p-3 rounded-lg transition-all duration-200 ${
                    sortOption === option.value
                      ? 'bg-white/20 text-white border border-white/30'
                      : 'bg-white/5 text-gray-300 hover:bg-white/10 border border-transparent'
                  } ${isSorting ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{option.icon}</span>
                    <span className="font-medium">{option.label}</span>
                    {sortOption === option.value && (
                      <span className="ml-auto text-green-400">✓</span>
                    )}
                    {isSorting && sortOption === option.value && (
                      <div className="ml-auto w-4 h-4 border-2 border-green-400 border-t-transparent rounded-full animate-spin"></div>
                    )}
                  </div>
                </button>
              ))}
            </div>
            <div className="flex justify-end mt-6">
              <Button
                variant="outline"
                onClick={() => setShowSortModal(false)}
                className="bg-transparent text-gray-300 border-gray-600 hover:bg-gray-700 hover:text-white"
              >
                取消
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
