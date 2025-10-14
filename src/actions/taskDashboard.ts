"use server";

import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// 获取任务统计信息
export async function getTaskStats() {
    const session = await auth();

    if (!session?.user?.id) {
        throw new Error("用户未登录，请先登录");
    }

    const [total, pending, inProgress, completed] = await Promise.all([
        prisma.task.count({
            where: { userId: session.user.id }
        }),
        prisma.task.count({
            where: {
                userId: session.user.id,
                status: "pending"
            }
        }),
        prisma.task.count({
            where: {
                userId: session.user.id,
                status: "in_progress"
            }
        }),
        prisma.task.count({
            where: {
                userId: session.user.id,
                status: "completed"
            }
        })
    ]);

    return {
        total,
        pending,
        inProgress,
        completed
    };
}

// 获取任务列表，按优先级和时间节点排序
export async function getTasksWithPriority(page: number = 1, limit: number = 10) {
    const session = await auth();

    if (!session?.user?.id) {
        throw new Error("用户未登录，请先登录");
    }

    const skip = (page - 1) * limit;

    // 优先级权重映射
    const priorityWeights = {
        urgent: 4,
        high: 3,
        medium: 2,
        low: 1
    };

    const tasks = await prisma.task.findMany({
        where: {
            userId: session.user.id,
            // 只查询未完成的任务
            status: {
                not: 'completed'
            }
        },
        include: {
            list: {
                select: {
                    name: true,
                    color: true
                }
            }
        },
        orderBy: [
            // 首先按截止时间排序（有截止时间的优先，然后按时间升序）
            {
                expiresAt: 'asc'
            },
            // 然后按优先级排序
            {
                priority: 'desc'
            },
            // 最后按创建时间排序
            {
                createdAt: 'desc'
            }
        ],
        skip,
        take: limit
    });

    // 手动排序以确保正确的优先级顺序
    const sortedTasks = tasks.sort((a, b) => {
        // 状态优先级：进行中 > 待处理 > 暂停 > 取消
        const statusOrder = {
            'in_progress': 1,
            'pending': 2,
            'paused': 3,
            'cancelled': 4
        };

        const statusA = statusOrder[a.status as keyof typeof statusOrder] || 5;
        const statusB = statusOrder[b.status as keyof typeof statusOrder] || 5;

        if (statusA !== statusB) {
            return statusA - statusB;
        }

        // 相同状态下按截止时间排序（即将到期的优先）
        if (a.expiresAt && b.expiresAt) {
            return a.expiresAt.getTime() - b.expiresAt.getTime();
        }

        if (a.expiresAt && !b.expiresAt) {
            return -1;
        }

        if (!a.expiresAt && b.expiresAt) {
            return 1;
        }

        // 相同截止时间下按优先级排序
        const priorityA = priorityWeights[a.priority as keyof typeof priorityWeights] || 0;
        const priorityB = priorityWeights[b.priority as keyof typeof priorityWeights] || 0;

        if (priorityA !== priorityB) {
            return priorityB - priorityA;
        }

        // 最后按创建时间排序
        return b.createdAt.getTime() - a.createdAt.getTime();
    });

    return sortedTasks;
}

// 更新任务状态
export async function updateTaskStatus(taskId: number, status: string) {
    const session = await auth();

    if (!session?.user?.id) {
        throw new Error("用户未登录，请先登录");
    }

    await prisma.task.update({
        where: {
            id: taskId,
            userId: session.user.id
        },
        data: {
            status: status as any,
            done: status === 'completed'
        }
    });

    revalidatePath("/");
}

// 更新任务进度（通过计算完成度）
export async function updateTaskProgress(taskId: number, progress: number) {
    const session = await auth();

    if (!session?.user?.id) {
        throw new Error("用户未登录，请先登录");
    }

    // 这里可以根据进度自动更新状态
    let newStatus = 'pending';
    if (progress === 100) {
        newStatus = 'completed';
    } else if (progress > 0) {
        newStatus = 'in_progress';
    }

    await prisma.task.update({
        where: {
            id: taskId,
            userId: session.user.id
        },
        data: {
            status: newStatus as any,
            done: newStatus === 'completed'
        }
    });

    revalidatePath("/");
}
