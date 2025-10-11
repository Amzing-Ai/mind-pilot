import dayjs from "dayjs";

export interface ParsedTask {
    content: string;
    priority: "low" | "medium" | "high" | "urgent";
    estimatedHours?: number;
    startTime?: Date;
    expiresAt?: Date;
    status: "pending" | "in_progress" | "completed" | "paused" | "cancelled";
}

/**
 * 从AI回复中解析任务信息
 * @param aiResponse AI助手的回复文本
 * @returns 解析出的任务列表
 */
export function parseTasksFromAIResponse(aiResponse: string): ParsedTask[] {
    const tasks: ParsedTask[] = [];

    // 匹配任务列表的正则表达式
    // 支持格式：1. **任务名** - 说明 (⏰ 时间 | 🔥 优先级)
    const taskRegex = /(\d+\.?\s*)?\*\*(.+?)\*\*\s*[-–—]\s*(.+?)(?:\s*\([^)]*\))?(?=\n|$|\d+\.)/g;

    let match;
    while ((match = taskRegex.exec(aiResponse)) !== null) {
        const taskName = match[2]?.trim() ?? "";
        const description = match[3]?.trim() ?? "";
        const fullContent = `${taskName} - ${description}`;

        // 解析优先级
        const priority = parsePriority(aiResponse, match[0] ?? "");

        // 解析时间信息
        const timeInfo = parseTimeInfo(match[0] ?? "");

        // 计算截止时间
        const expiresAt = calculateExpiresAt(timeInfo.estimatedHours);

        // 计算开始时间（当前时间）
        const startTime = new Date();

        tasks.push({
            content: fullContent,
            priority,
            estimatedHours: timeInfo.estimatedHours,
            startTime,
            expiresAt,
            status: "pending",
        });
    }

    // 如果没有匹配到标准格式，尝试其他格式
    if (tasks.length === 0) {
        return parseAlternativeFormats(aiResponse);
    }

    return tasks;
}

/**
 * 解析优先级
 */
function parsePriority(text: string, taskLine: string): "low" | "medium" | "high" | "urgent" {
    const lowerText = taskLine.toLowerCase();

    // 检查优先级标识符 - 优先检查火焰表情符号
    if (lowerText.includes("🔥🔥🔥🔥") || lowerText.includes("urgent") || lowerText.includes("紧急")) {
        return "urgent";
    }
    if (lowerText.includes("🔥🔥🔥") || lowerText.includes("high") || lowerText.includes("高")) {
        return "high";
    }
    if (lowerText.includes("🔥🔥") || lowerText.includes("medium") || lowerText.includes("中")) {
        return "medium";
    }
    if (lowerText.includes("🔥") || lowerText.includes("low") || lowerText.includes("低")) {
        return "low";
    }

    // 根据任务在列表中的位置判断优先级
    const taskIndex = text.indexOf(taskLine);
    const beforeText = text.substring(0, taskIndex);
    const taskNumber = (beforeText.match(/\d+\./g) ?? []).length;

    // 前3个任务优先级较高
    if (taskNumber <= 2) return "high";
    if (taskNumber <= 4) return "medium";
    return "low";
}

/**
 * 解析时间信息
 */
function parseTimeInfo(taskLine: string): { estimatedHours?: number } {
    // 匹配时间模式：⏰ 2小时、⏰ 1天、⏰ 30分钟等
    const timeRegex = /⏰\s*(\d+(?:\.\d+)?)\s*(小时|天|分钟|h|d|min)/i;
    const match = timeRegex.exec(taskLine);

    if (match) {
        const value = parseFloat(match[1] ?? "0");
        const unit = match[2]?.toLowerCase() ?? "";

        switch (unit) {
            case "小时":
            case "h":
                return { estimatedHours: value };
            case "天":
            case "d":
                return { estimatedHours: value * 24 };
            case "分钟":
            case "min":
                return { estimatedHours: value / 60 };
            default:
                return { estimatedHours: value };
        }
    }

    // 如果没有明确时间，根据任务复杂度估算
    const complexity = estimateTaskComplexity(taskLine);
    return { estimatedHours: complexity };
}

/**
 * 估算任务复杂度（小时）
 */
function estimateTaskComplexity(taskLine: string): number {
    const lowerLine = taskLine.toLowerCase();

    // 关键词匹配
    if (lowerLine.includes("研究") || lowerLine.includes("分析") || lowerLine.includes("设计")) {
        return 4; // 复杂任务
    }
    if (lowerLine.includes("学习") || lowerLine.includes("阅读") || lowerLine.includes("练习")) {
        return 2; // 中等任务
    }
    if (lowerLine.includes("检查") || lowerLine.includes("确认") || lowerLine.includes("发送")) {
        return 0.5; // 简单任务
    }

    // 根据任务长度估算
    const wordCount = taskLine.split(/\s+/).length;
    if (wordCount > 20) return 3;
    if (wordCount > 10) return 2;
    return 1;
}

/**
 * 计算截止时间
 */
function calculateExpiresAt(estimatedHours?: number): Date | undefined {
    if (!estimatedHours) return undefined;

    const now = dayjs();
    const expiresAt = now.add(estimatedHours, "hour");

    // 如果计算出的时间超过7天，则设置为7天后
    if (expiresAt.diff(now, "day") > 7) {
        return now.add(7, "day").toDate();
    }

    return expiresAt.toDate();
}

/**
 * 解析其他格式的任务
 */
function parseAlternativeFormats(text: string): ParsedTask[] {
    const tasks: ParsedTask[] = [];

    // 匹配简单的任务列表格式
    const simpleTaskRegex = /(\d+\.?\s*)(.+?)(?=\n|\d+\.|$)/g;
    let match;

    while ((match = simpleTaskRegex.exec(text)) !== null) {
        const content = match[2]?.trim() ?? "";
        if (content.length > 0) {
            tasks.push({
                content,
                priority: "medium",
                status: "pending",
                startTime: new Date(),
            });
        }
    }

    return tasks;
}

/**
 * 从AI回复中提取主题作为清单名称
 */
export function extractListNameFromAIResponse(aiResponse: string): string {
    // 匹配目标分析部分
    const goalMatch = /### 🎯 目标分析\s*\n(.+?)(?=\n|$)/.exec(aiResponse);
    if (goalMatch) {
        const goalText = goalMatch[1]?.trim() ?? "";
        // 清理文本，提取核心主题
        const cleanGoal = goalText
            .replace(/[，。！？；：]/g, '') // 移除标点符号
            .replace(/\s+/g, ' ') // 合并多个空格
            .trim();

        // 如果目标描述过长，截取前20个字符
        if (cleanGoal.length > 20) {
            return cleanGoal.substring(0, 20) + '...';
        }
        return cleanGoal;
    }

    // 如果没有找到目标分析，尝试从任务清单中提取
    const taskMatch = /### 📝 任务清单\s*\n(.+?)(?=\n|$)/.exec(aiResponse);
    if (taskMatch) {
        const taskText = taskMatch[1]?.trim() ?? "";
        // 从第一个任务中提取关键词
        const firstTaskMatch = /\*\*(.+?)\*\*/.exec(taskText);
        if (firstTaskMatch) {
            const taskName = firstTaskMatch[1]?.trim() ?? "";
            // 提取动词或核心词
            const coreWords = taskName.split(/[\s\-–—]/).filter(word => word.length > 1);
            if (coreWords.length > 0) {
                return coreWords[0] + '相关任务';
            }
        }
    }

    // 默认清单名称
    return 'AI生成任务';
}

/**
 * 验证解析出的任务
 */
export function validateParsedTasks(tasks: ParsedTask[]): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (tasks.length === 0) {
        errors.push("未找到任何任务");
    }

    tasks.forEach((task, index) => {
        if (!task.content || task.content.trim().length === 0) {
            errors.push(`任务 ${index + 1} 内容为空`);
        }

        if (task.content.length > 500) {
            errors.push(`任务 ${index + 1} 内容过长`);
        }
    });

    return {
        valid: errors.length === 0,
        errors,
    };
}
