"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Save, Plus, Trash2, Clock, Flame, Edit3 } from "lucide-react";
import { toast } from "sonner";
import { createListAndTasks } from "@/actions/createListAndTasks";
import type { ParsedTask } from "@/lib/taskParser";

interface EditableTask {
  id: string;
  content: string;
  priority: "low" | "medium" | "high" | "urgent";
  estimatedHours?: number;
  startTime?: Date;
  expiresAt?: Date;
  status: "pending" | "in_progress" | "completed" | "paused" | "cancelled";
}

export default function ManualEditPage() {
  const router = useRouter();
  const [tasks, setTasks] = useState<EditableTask[]>([]);
  const [listName, setListName] = useState<string>("");
  const [isCreating, setIsCreating] = useState(false);

  // 从sessionStorage获取数据
  useEffect(() => {
    const savedTasks = sessionStorage.getItem("manualEditTasks");
    const savedListName = sessionStorage.getItem("manualEditListName");

    if (savedTasks) {
      try {
        const parsedTasks = JSON.parse(savedTasks);
        setTasks(parsedTasks);
      } catch (error) {
        console.error("解析任务数据失败:", error);
        toast.error("数据解析失败，请重新生成任务");
        router.push("/chat");
      }
    } else {
      toast.error("未找到任务数据，请重新生成");
      router.push("/chat");
    }

    if (savedListName) {
      setListName(savedListName);
    }
  }, [router]);

  // 更新任务内容
  const updateTask = (id: string, field: keyof EditableTask, value: any) => {
    setTasks(prev => prev.map(task =>
      task.id === id ? { ...task, [field]: value } : task
    ));
  };

  // 添加新任务
  const addTask = () => {
    const now = new Date();
    const newTask: EditableTask = {
      id: Date.now().toString(),
      content: "",
      priority: "medium",
      estimatedHours: undefined,
      startTime: now,
      expiresAt: undefined,
      status: "pending"
    };
    setTasks(prev => [...prev, newTask]);
  };

  // 删除任务
  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(task => task.id !== id));
  };

  // 计算截止时间
  const calculateExpiresAt = (estimatedHours: number) => {
    const now = new Date();
    return new Date(now.getTime() + estimatedHours * 60 * 60 * 1000);
  };

  // 处理时间变化
  const handleTimeChange = (id: string, hours: number) => {
    const now = new Date();
    updateTask(id, "estimatedHours", hours);
    updateTask(id, "startTime", now);
    updateTask(id, "expiresAt", calculateExpiresAt(hours));
  };

  // 返回聊天页面
  const handleBack = () => {
    router.push("/chat");
  };

  // 创建清单和任务
  const handleCreate = async () => {
    if (tasks.length === 0) {
      toast.error("请至少添加一个任务");
      return;
    }

    if (tasks.some(task => !task.content.trim())) {
      toast.error("请填写所有任务内容");
      return;
    }

    setIsCreating(true);

    try {
      // 转换数据格式
      const formattedTasks: ParsedTask[] = tasks.map(task => ({
        content: task.content,
        priority: task.priority,
        estimatedHours: task.estimatedHours || 1, // 默认1小时
        startTime: task.startTime,
        expiresAt: task.expiresAt || (task.estimatedHours ? calculateExpiresAt(task.estimatedHours) : calculateExpiresAt(1)),
        status: task.status
      }));

      const result = await createListAndTasks({
        listName: listName || "手动编辑任务",
        listColor: "#3B82F6",
        tasks: formattedTasks,
      });

      if (result.success) {
        toast.success(`成功创建清单"${listName}"和${result.taskCount}个任务！`);

        // 清除sessionStorage
        sessionStorage.removeItem("manualEditTasks");
        sessionStorage.removeItem("manualEditListName");

        // 跳转到首页
        router.push("/");
      } else {
        toast.error("创建清单和任务失败，请稍后重试");
      }
    } catch (error) {
      console.error("创建任务失败:", error);
      toast.error("创建失败，请稍后重试");
    } finally {
      setIsCreating(false);
    }
  };

  // 优先级选项
  const priorityOptions = [
    { value: "low", label: "低", icon: "🔥", color: "text-green-500" },
    { value: "medium", label: "中", icon: "🔥🔥", color: "text-yellow-500" },
    { value: "high", label: "高", icon: "🔥🔥🔥", color: "text-orange-500" },
    { value: "urgent", label: "紧急", icon: "🔥🔥🔥🔥", color: "text-red-500" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 pb-20">
      {/* Header */}
      <div className="border-b border-white/10 bg-white/5 backdrop-blur">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <motion.button
                onClick={handleBack}
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-all duration-200"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">返回</span>
              </motion.button>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-white">修改任务</h1>
                <p className="text-white/70 text-xs sm:text-sm hidden sm:block">编辑任务详情</p>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* List Name */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <label className="block text-white font-medium mb-2">清单名称</label>
          <input
            type="text"
            value={listName}
            onChange={(e) => setListName(e.target.value)}
            placeholder="输入清单名称"
            className="w-full px-4 py-3 rounded-xl border border-white/20 bg-white/10 text-white placeholder-white/60 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/50 transition-all duration-200"
          />
        </motion.div>

        {/* Tasks */}
        <div className="space-y-6">
          {tasks.map((task, index) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white/10 backdrop-blur rounded-2xl p-6 border border-white/20"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                    {index + 1}
                  </div>
                  <h3 className="text-white font-medium">任务 {index + 1}</h3>
                </div>
                <motion.button
                  onClick={() => deleteTask(task.id)}
                  className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all duration-200"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Trash2 className="h-4 w-4" />
                </motion.button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 任务内容 */}
                <div className="lg:col-span-2">
                  <label className="block text-white/80 text-sm font-medium mb-2">任务内容</label>
                  <textarea
                    value={task.content}
                    onChange={(e) => updateTask(task.id, "content", e.target.value)}
                    placeholder="输入任务描述..."
                    className="w-full px-4 py-3 rounded-xl border border-white/20 bg-white/10 text-white placeholder-white/60 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/50 transition-all duration-200 resize-none"
                    rows={3}
                  />
                </div>

                {/* 优先级 */}
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">优先级</label>
                  <select
                    value={task.priority}
                    onChange={(e) => updateTask(task.id, "priority", e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-white/20 bg-white/10 text-white focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/50 transition-all duration-200"
                    style={{ colorScheme: 'dark' }}
                  >
                    {priorityOptions.map(option => (
                      <option key={option.value} value={option.value} className="bg-gray-800 text-white">
                        {option.icon} {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 预估时间 */}
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">预估时间（小时）</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      max="168"
                      step="0.5"
                      value={task.estimatedHours || ""}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === "") {
                          updateTask(task.id, "estimatedHours", undefined);
                          updateTask(task.id, "expiresAt", undefined);
                        } else {
                          const hours = parseFloat(value);
                          if (!isNaN(hours) && hours > 0) {
                            handleTimeChange(task.id, hours);
                          }
                        }
                      }}
                      placeholder="输入小时数"
                      className="flex-1 px-4 py-3 rounded-xl border border-white/20 bg-white/10 text-white placeholder-white/60 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/50 transition-all duration-200"
                    />
                    <div className="p-3 rounded-xl bg-white/10">
                      <Clock className="h-4 w-4 text-white/60" />
                    </div>
                  </div>
                </div>
              </div>

              {/* 时间信息 */}
              {task.estimatedHours && (
                <div className="mt-4 p-4 bg-white/5 rounded-xl">
                  <div className="flex flex-col gap-2 text-sm text-white/70 sm:flex-row sm:gap-4">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>开始时间: {task.startTime?.toLocaleString('zh-CN', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Flame className="h-4 w-4" />
                      <span>截止时间: {task.expiresAt?.toLocaleString('zh-CN', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}</span>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Add Task Button */}
        <motion.button
          onClick={addTask}
          className="w-full mt-8 py-4 rounded-xl border-2 border-dashed border-white/30 text-white/70 hover:border-white/50 hover:text-white transition-all duration-200 flex items-center justify-center gap-2"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Plus className="h-5 w-5" />
          添加新任务
        </motion.button>

        {/* Create List Button - Bottom */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4">
          <motion.button
            onClick={handleBack}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-all duration-200 w-full sm:w-auto"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ArrowLeft className="h-4 w-4" />
            返回
          </motion.button>

          <motion.button
            onClick={handleCreate}
            disabled={isCreating}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 w-full sm:w-auto"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isCreating ? (
              <>
                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>创建中...</span>
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                <span>创建清单</span>
              </>
            )}
          </motion.button>
        </div>
      </div>
      </div>
    </div>
  );
}
