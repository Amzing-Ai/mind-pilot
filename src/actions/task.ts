"use server";

import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import {
    createTaskZodSchema,
    type createTaskZodSchemaType,
    createTasksZodSchema,
    type createTasksZodSchemaType,
} from "@/schema/createTask";

export async function createTask(data: createTaskZodSchemaType) {
    const session = await auth();

    if (!(session?.user?.id)) {
        throw new Error("用户未登录，请先登录");
    }

    const result = createTaskZodSchema.safeParse(data);

    if (!result.success) {
        return {
            success: false,
            message: result.error.flatten().fieldErrors,
        };
    }

    const { content, expiresAt, todoId, priority, status, startTime } = data;

    await prisma.task.create({
        data: {
            userId: session.user.id,
            content,
            expiresAt,
            priority: priority as any,
            status: status as any,
            startTime,
            list: {
                connect: {
                    id: todoId,
                },
            },
        },
    });

    revalidatePath("/");
}

// 批量创建任务
export async function createTasks(data: createTasksZodSchemaType) {
    const session = await auth();

    if (!(session?.user?.id)) {
        throw new Error("用户未登录，请先登录");
    }

    const result = createTasksZodSchema.safeParse(data);

    if (!result.success) {
        return {
            success: false,
            message: result.error.flatten().fieldErrors,
        };
    }

    const { todoId, tasks } = data;

    try {
        const createdTasks = await prisma.task.createMany({
            data: tasks.map(task => ({
                userId: session.user.id!,
                content: task.content,
                expiresAt: task.expiresAt,
                priority: task.priority as any,
                status: task.status as any,
                startTime: task.startTime,
                ListId: todoId,
            })),
        });

        revalidatePath("/");

        return {
            success: true,
            message: `成功创建 ${createdTasks.count} 个任务`,
            count: createdTasks.count,
        };
    } catch (error) {
        console.error("批量创建任务失败:", error);
        throw new Error("批量创建任务失败，请稍后重试");
    }
}

// ...

export async function setTaskStatus(id: number, done: boolean) {
    const session = await auth();

    if (!(session?.user?.id)) {
        throw new Error("用户未登录，请先登录");
    }

    await prisma.task.update({
        where: {
            id: id,
            userId: session.user.id,
        },
        data: {
            done: done,
        },
    });

    revalidatePath("/");
}
