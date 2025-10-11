"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { parseTasksFromAIResponse, validateParsedTasks } from "@/lib/taskParser";
import { createTasks } from "@/actions/task";
import { toast } from "sonner";

export default function TaskCreationTest() {
  const [testInput, setTestInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleTest = async () => {
    if (!testInput.trim()) {
      toast.error("请输入测试内容");
      return;
    }

    setIsLoading(true);

    try {
      // 解析任务
      const tasks = parseTasksFromAIResponse(testInput);
      console.log("解析出的任务:", tasks);

      // 验证任务
      const validation = validateParsedTasks(tasks);
      if (!validation.valid) {
        toast.error(`任务验证失败: ${validation.errors.join(", ")}`);
        return;
      }

      if (tasks.length === 0) {
        toast.error("未找到任何任务");
        return;
      }

      // 创建任务（使用默认清单ID 1）
      const result = await createTasks({
        todoId: 1,
        tasks: tasks.map(task => ({
          content: task.content,
          expiresAt: task.expiresAt,
          priority: task.priority,
          status: task.status,
          startTime: task.startTime,
        })),
      });

      if (result.success) {
        toast.success(`成功创建 ${result.count} 个任务！`);
        setTestInput("");
      } else {
        toast.error("创建任务失败");
      }
    } catch (error) {
      console.error("测试失败:", error);
      toast.error("测试失败，请检查控制台");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg">
      <h3 className="text-lg font-semibold mb-4">任务创建测试</h3>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            测试AI回复内容：
          </label>
          <textarea
            value={testInput}
            onChange={(e) => setTestInput(e.target.value)}
            placeholder="粘贴AI助手的回复内容进行测试..."
            className="w-full h-32 p-3 border rounded-md resize-none"
          />
        </div>

        <Button
          onClick={handleTest}
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? "测试中..." : "测试任务创建"}
        </Button>

        <div className="text-sm text-gray-600">
          <p>测试格式示例：</p>
          <pre className="mt-2 p-2 bg-gray-100 rounded text-xs">
{`### 📝 任务清单
1. **制定学习计划** - 列出具体的学习内容和时间安排 (⏰ 1小时 | 🔥🔥)
2. **收集学习资料** - 整理相关书籍、视频、文档等资源 (⏰ 30分钟 | 🔥🔥🔥)
3. **开始学习** - 按照计划开始第一课的学习 (⏰ 2小时 | 🔥🔥🔥🔥)`}
          </pre>
        </div>
      </div>
    </div>
  );
}
