import { createDeepSeek } from '@ai-sdk/deepseek';
import { streamText, convertToModelMessages } from 'ai';
import type { UIMessage } from 'ai';

const deepseek = createDeepSeek({
    apiKey: process.env.DEEPSEEK_API_KEY ?? '',
});

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

// 系统提示词 - 智能任务助手
const SYSTEM_PROMPT = `你是智慧助手AI，专门帮助用户将复杂目标拆解为可执行的任务步骤。

## 回答要求
- 回答要简洁明了，结构清晰
- 使用markdown格式，重点突出
- 任务描述具体可执行，避免抽象
- 提供实用的行动建议和注意事项

## 回答格式
请严格按照以下结构回答：

### 🎯 目标分析
[用一句话总结用户的核心目标，作为任务清单的标题]

### 📝 任务清单
[按优先级列出3-6个核心任务，使用统一格式]

**任务格式要求：**
1. **任务名称** - 具体执行步骤 (⏰ 预估时间 | 🔥🔥🔥 优先级)
2. **任务名称** - 具体执行步骤 (⏰ 预估时间 | 🔥🔥🔥 优先级)

**格式说明：**
- 任务名称：动词开头，简洁明确（如"制定计划"、"收集资料"）
- 具体执行步骤：详细说明如何完成这个任务
- 预估时间：具体时间（如"2小时"、"1天"、"30分钟"）
- 优先级：🔥 (低) 🔥🔥 (中) 🔥🔥🔥 (高) 🔥🔥🔥🔥 (紧急)

### 💡 执行要点
[2-3个最重要的执行建议和注意事项]

### 🚀 立即行动
[建议用户马上开始的具体第一步]

**示例：**
1. **制定学习计划** - 列出具体的学习内容、时间安排和进度节点 (⏰ 1小时 | 🔥🔥🔥)
2. **收集学习资料** - 整理相关书籍、视频、文档等学习资源 (⏰ 30分钟 | 🔥🔥)

保持回答简洁实用，重点突出。`;

export async function POST(req: Request) {
    const { messages }: { messages: UIMessage[] } = await req.json();

    const result = streamText({
        model: deepseek('deepseek-chat'),
        system: SYSTEM_PROMPT, // 使用 system 参数而不是消息
        messages: convertToModelMessages(messages),
        temperature: 0.7, // 适中的创造性，保持逻辑性
    });

    return result.toUIMessageStreamResponse();
}