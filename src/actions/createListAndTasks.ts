"use server";

import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { type ParsedTask } from "@/lib/taskParser";

export async function createListAndTasks(data: {
    listName: string;
    listColor: string;
    tasks: ParsedTask[];
}) {
    const session = await auth();

    if (!(session?.user?.id)) {
        throw new Error("用户未登录，请先登录");
    }

    const { listName, listColor, tasks } = data;

    try {
        // 创建清单
        const newList = await prisma.list.create({
            data: {
                userId: session.user.id,
                name: listName,
                color: listColor,
            },
        });

        console.log("创建的清单:", newList);

        // 创建任务
        if (tasks.length > 0 && session.user?.id) {
            const taskData = tasks.map(task => ({
                userId: session.user!.id as string,
                content: task.content,
                expiresAt: task.expiresAt,
                priority: task.priority as any,
                status: task.status as any,
                startTime: task.startTime,
                ListId: newList.id,
            }));

            const createdTasks = await prisma.task.createMany({
                data: taskData,
            });

            console.log("创建的任务数量:", createdTasks.count);
        }

        revalidatePath("/");

        return {
            success: true,
            message: `成功创建清单"${listName}"和${tasks.length}个任务`,
            listId: newList.id,
            taskCount: tasks.length,
            listName: newList.name,
        };
    } catch (error) {
        console.error("创建清单和任务失败:", error);
        throw new Error("创建清单和任务失败，请稍后重试");
    }
}
