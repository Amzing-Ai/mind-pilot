"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { parseTasksFromAIResponse, validateParsedTasks } from "@/lib/taskParser";
import { toast } from "sonner";

export default function TaskCreationDebug() {
  const [testInput, setTestInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>(null);

  const handleTest = async () => {
    if (!testInput.trim()) {
      toast.error("请输入测试内容");
      return;
    }

    setIsLoading(true);
    setDebugInfo(null);

    try {
      console.log("开始解析任务...");

      // 解析任务
      const tasks = parseTasksFromAIResponse(testInput);
      console.log("解析出的任务:", tasks);

      // 验证任务
      const validation = validateParsedTasks(tasks);
      console.log("验证结果:", validation);

      if (!validation.valid) {
        toast.error(`任务验证失败: ${validation.errors.join(", ")}`);
        setDebugInfo({ error: validation.errors });
        return;
      }

      if (tasks.length === 0) {
        toast.error("未找到任何任务");
        setDebugInfo({ error: "未找到任何任务" });
        return;
      }

      // 模拟创建任务（不实际创建）
      setDebugInfo({
        success: true,
        tasks: tasks,
        count: tasks.length,
        message: "任务解析成功，准备创建..."
      });

      toast.success(`成功解析 ${tasks.length} 个任务！`);

    } catch (error) {
      console.error("测试失败:", error);
      toast.error("测试失败，请检查控制台");
      setDebugInfo({ error: error instanceof Error ? error.message : '未知错误' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg bg-white">
      <h3 className="text-lg font-semibold mb-4">任务创建调试工具</h3>

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
          {isLoading ? "测试中..." : "测试任务解析"}
        </Button>

        {debugInfo && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold mb-2">调试信息：</h4>
            <pre className="text-sm overflow-auto max-h-40">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </div>
        )}

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
