import { z } from "zod";

export const createTaskZodSchema = z.object({
    todoId: z.number().nonnegative(),
    content: z.string().min(1, {
        message: "请填写任务内容",
    }),
    expiresAt: z.date().optional(),
});

export type createTaskZodSchemaType = z.infer<typeof createTaskZodSchema>;
