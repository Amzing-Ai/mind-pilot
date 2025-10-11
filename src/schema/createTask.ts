import { z } from "zod";

export const createTaskZodSchema = z.object({
    todoId: z.number().nonnegative(),
    content: z.string().min(1, {
        message: "请填写任务内容",
    }),
    expiresAt: z.date().optional(),
    priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
    status: z.enum(["pending", "in_progress", "completed", "paused", "cancelled"]).default("pending"),
    startTime: z.date().optional(),
});

export type createTaskZodSchemaType = z.infer<typeof createTaskZodSchema>;

// 批量创建任务的schema
export const createTasksZodSchema = z.object({
    todoId: z.number().nonnegative(),
    tasks: z.array(z.object({
        content: z.string().min(1),
        expiresAt: z.date().optional(),
        priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
        status: z.enum(["pending", "in_progress", "completed", "paused", "cancelled"]).default("pending"),
        startTime: z.date().optional(),
    })).min(1),
});

export type createTasksZodSchemaType = z.infer<typeof createTasksZodSchema>;
