"use server";

import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";

export async function createTasksSimple(data: {
    todoId: number;
    tasks: Array<{
        content: string;
        expiresAt?: Date;
        priority?: string;
        status?: string;
        startTime?: Date;
    }>;
}) {
    const session = await auth();

    if (!(session?.user?.id)) {
        throw new Error("用户未登录，请先登录");
    }

    const { todoId, tasks } = data;

    try {
        // 使用原始SQL插入，绕过Prisma类型问题
        const insertPromises = tasks.map(task =>
            prisma.$executeRaw`
        INSERT INTO Task (content, userId, done, expiresAt, createdAt, priority, status, startTime, ListId)
        VALUES (${task.content}, ${session.user.id!}, false, ${task.expiresAt}, NOW(), ${task.priority || 'medium'}, ${task.status || 'pending'}, ${task.startTime}, ${todoId})
      `
        );

        await Promise.all(insertPromises);

        revalidatePath("/");

        return {
            success: true,
            message: `成功创建 ${tasks.length} 个任务`,
            count: tasks.length,
        };
    } catch (error) {
        console.error("批量创建任务失败:", error);
        throw new Error("批量创建任务失败，请稍后重试");
    }
}
