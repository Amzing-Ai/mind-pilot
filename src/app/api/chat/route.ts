import { createDeepSeek } from '@ai-sdk/deepseek';
import { streamText, convertToModelMessages } from 'ai';
import type { UIMessage } from 'ai';

const deepseek = createDeepSeek({
    apiKey: process.env.DEEPSEEK_API_KEY ?? '',
});

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
    const { messages }: { messages: UIMessage[] } = await req.json();

    const result = streamText({
        model: deepseek('deepseek-chat'),
        messages: convertToModelMessages(messages),
    });

    return result.toUIMessageStreamResponse();
}