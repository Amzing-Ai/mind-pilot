"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, X, Palette, List, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { createListAndTasks } from "@/actions/createListAndTasks";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const colorOptions = [
  { name: "蓝色", value: "blue", bg: "bg-blue-500" },
  { name: "绿色", value: "green", bg: "bg-green-500" },
  { name: "紫色", value: "purple", bg: "bg-purple-500" },
  { name: "橙色", value: "orange", bg: "bg-orange-500" },
  { name: "红色", value: "red", bg: "bg-red-500" },
  { name: "粉色", value: "pink", bg: "bg-pink-500" },
];

interface FloatingCreateListFormProps {
  onClose?: () => void;
}

export default function FloatingCreateListForm({ onClose }: FloatingCreateListFormProps = {}) {
  const [isOpen, setIsOpen] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    listName: "",
    listColor: "blue",
    tasks: [{ content: "", priority: "medium", estimatedHours: "" }]
  });
  const router = useRouter();

  // 监听外部关闭
  useEffect(() => {
    if (onClose) {
      setIsOpen(true);
    }
  }, [onClose]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }

    if (!formData.listName.trim()) {
      toast.error("请输入清单名称");
      return;
    }

    const validTasks = formData.tasks.filter(task => task.content.trim() !== "");
    if (validTasks.length === 0) {
      toast.error("请至少添加一个任务");
      return;
    }

    setIsCreating(true);

    try {
      // 转换任务数据格式
      const parsedTasks = validTasks.map(task => {
        // 根据所需时间计算截止时间
        let expiresAt = undefined;
        if (task.estimatedHours && parseFloat(task.estimatedHours) > 0) {
          const hours = parseFloat(task.estimatedHours);
          const now = new Date();
          expiresAt = new Date(now.getTime() + hours * 60 * 60 * 1000);
        }

        return {
          content: task.content.trim(),
          priority: task.priority as "low" | "medium" | "high" | "urgent",
          expiresAt: expiresAt,
          status: "pending" as const
        };
      });

      await createListAndTasks({
        listName: formData.listName.trim(),
        listColor: formData.listColor,
        tasks: parsedTasks
      });

      toast.success("清单创建成功！");
      setIsOpen(false);
      setFormData({
        listName: "",
        listColor: "blue",
        tasks: [{ content: "", priority: "medium", estimatedHours: "" }]
      });
      onClose?.();
      router.refresh();
    } catch {
      toast.error("创建清单失败，请重试");
    } finally {
      setIsCreating(false);
    }
  };

  const addTask = () => {
    setFormData(prev => ({
      ...prev,
      tasks: [...prev.tasks, { content: "", priority: "medium", estimatedHours: "" }]
    }));
  };

  const removeTask = (index: number) => {
    if (formData.tasks.length > 1) {
      setFormData(prev => ({
        ...prev,
        tasks: prev.tasks.filter((_, i) => i !== index)
      }));
    }
  };

  const updateTask = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      tasks: prev.tasks.map((task, i) =>
        i === index ? { ...task, [field]: value } : task
      )
    }));
  };

  if (!isOpen) {
    return null;
  }

  return (
    <>
      {/* Backdrop */}
      <motion.div
        className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => {
          setIsOpen(false);
          onClose?.();
        }}
      />

      {/* Form */}
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <Card className="w-full max-w-md max-h-[80vh] bg-white shadow-2xl border-0 flex flex-col py-0">
          <CardHeader className="px-6 py-3 rounded-t-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <motion.div
                  initial={{ rotate: -180 }}
                  animate={{ rotate: 0 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                >
                  <Sparkles className="h-5 w-5" />
                </motion.div>
                <CardTitle className="text-lg">创建新清单</CardTitle>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setIsOpen(false);
                  onClose?.();
                }}
                className="h-8 w-8 text-white hover:bg-white/20"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>

        <CardContent className="px-6 py-4 flex-1 overflow-y-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* List Name */}
            <motion.div
              className="space-y-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Label htmlFor="listName" className="text-gray-800 font-semibold flex items-center gap-2 text-sm uppercase tracking-wide">
                <div className="p-1 bg-blue-100 rounded-md">
                  <List className="h-3 w-3 text-blue-600" />
                </div>
                清单名称
              </Label>
              <Input
                id="listName"
                value={formData.listName}
                onChange={(e) => setFormData(prev => ({ ...prev, listName: e.target.value }))}
                placeholder="输入清单名称"
                className="text-gray-900 border border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 bg-gray-50/50 transition-all duration-300"
                required
              />
            </motion.div>

            {/* Color Selection */}
            <motion.div
              className="space-y-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Label className="text-gray-800 font-semibold flex items-center gap-2 text-sm uppercase tracking-wide">
                <div className="p-1 bg-purple-100 rounded-md">
                  <Palette className="h-3 w-3 text-purple-600" />
                </div>
                选择颜色
              </Label>
              <div className="grid grid-cols-3 gap-3">
                {colorOptions.map((color, index) => (
                  <motion.button
                    key={color.value}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, listColor: color.value }))}
                    className={`p-3 rounded-xl border-2 transition-all duration-300 hover:scale-105 ${
                      formData.listColor === color.value
                        ? 'border-blue-500 scale-105 shadow-lg'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div className={`w-8 h-8 rounded-full ${color.bg} mx-auto shadow-md`} />
                    <span className="text-xs text-gray-600 mt-2 block font-medium">{color.name}</span>
                  </motion.button>
                ))}
              </div>
            </motion.div>

            {/* Tasks */}
            <motion.div
              className="space-y-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Label className="text-gray-800 font-semibold flex items-center gap-2 text-sm uppercase tracking-wide">
                <div className="p-1 bg-green-100 rounded-md">
                  <List className="h-3 w-3 text-green-600" />
                </div>
                任务列表
              </Label>
              <div className="space-y-4 max-h-60 overflow-y-auto">
                {formData.tasks.map((task, index) => (
                  <motion.div
                    key={index}
                    className="space-y-3 p-3 border border-gray-200 rounded-lg bg-gray-50/30"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                  >
                    <div className="flex gap-2">
                      <Input
                        value={task.content}
                        onChange={(e) => updateTask(index, "content", e.target.value)}
                        placeholder={`任务 ${index + 1}`}
                        className="flex-1 text-gray-900 border border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 bg-white transition-all duration-300"
                      />
                      {formData.tasks.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => removeTask(index)}
                          className="h-10 w-10 text-red-500 hover:bg-red-50 hover:border-red-300"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs text-gray-600 mb-1 block">优先级</Label>
                        <select
                          value={task.priority}
                          onChange={(e) => updateTask(index, "priority", e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:border-blue-400 focus:ring-2 focus:ring-blue-100 bg-white text-gray-900 transition-all duration-300"
                        >
                          <option value="low">低</option>
                          <option value="medium">中</option>
                          <option value="high">高</option>
                          <option value="urgent">紧急</option>
                        </select>
                      </div>

                      <div>
                        <Label className="text-xs text-gray-600 mb-1 block">所需时间(小时)</Label>
                        <Input
                          type="number"
                          min="0"
                          step="0.5"
                          value={task.estimatedHours}
                          onChange={(e) => updateTask(index, "estimatedHours", e.target.value)}
                          placeholder="例如: 2.5"
                          className="w-full text-sm border border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 bg-white text-gray-900 transition-all duration-300"
                        />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                <Button
                  type="button"
                  variant="outline"
                  onClick={addTask}
                  className="w-full text-gray-600 border border-dashed border-gray-300 bg-gradient-to-r from-blue-50/50 to-blue-100/30 hover:border-blue-400 hover:text-blue-600 hover:from-blue-100 hover:to-blue-200/50 font-medium transition-all duration-300"
                >
                  <div className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    添加任务
                  </div>
                </Button>
              </motion.div>
            </motion.div>

          </form>
        </CardContent>

        {/* Fixed Bottom Buttons */}
        <motion.div
          className="px-6 py-3 rounded-b-xl bg-white border-t border-gray-200 flex gap-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setIsOpen(false);
              onClose?.();
            }}
            className="flex-1 text-gray-600 border border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100/50 hover:border-red-300 hover:text-red-600 hover:from-red-50 hover:to-red-100/50 font-medium transition-all duration-300"
          >
            <div className="flex items-center gap-2">
              <X className="h-4 w-4" />
              取消
            </div>
          </Button>
          <motion.div
            className="flex-1"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={isCreating}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCreating ? (
                <div className="flex items-center gap-2">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <Sparkles className="h-4 w-4" />
                  </motion.div>
                  创建中...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  创建清单
                </div>
              )}
            </Button>
          </motion.div>
        </motion.div>
        </Card>
      </motion.div>
    </>
  );
}
