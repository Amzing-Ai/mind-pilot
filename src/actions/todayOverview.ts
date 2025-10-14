"use server";

import { auth } from "@/auth";
import prisma from "@/lib/prisma";

// 获取今日概览数据
export async function getTodayOverview() {
    const session = await auth();

    if (!session?.user?.id) {
        throw new Error("用户未登录，请先登录");
    }

    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    try {
        // 获取所有已完成的任务数量
        const completed = await prisma.task.count({
            where: {
                userId: session.user.id,
                status: 'completed'
            }
        });

        // 获取进行中的任务数量
        const inProgress = await prisma.task.count({
            where: {
                userId: session.user.id,
                status: 'in_progress'
            }
        });

        // 获取待处理的任务数量
        const pending = await prisma.task.count({
            where: {
                userId: session.user.id,
                status: 'pending'
            }
        });

        // 获取今日创建的任务数量
        const createdToday = await prisma.task.count({
            where: {
                userId: session.user.id,
                createdAt: {
                    gte: startOfDay,
                    lt: endOfDay
                }
            }
        });

        // 由于Task模型没有updatedAt字段，无法准确知道任务完成时间
        // 这里使用一个更合理的计算方式：基于总任务数的完成率
        const totalTasks = completed + inProgress + pending;
        const completionRate = totalTasks > 0 ? Math.round((completed / totalTasks) * 100) : 0;

        return {
            completedToday: completed, // 显示所有已完成的任务（与任务详情页一致）
            inProgress, // 显示所有进行中的任务（与任务详情页一致）
            pending, // 显示所有待处理的任务（与任务详情页一致）
            createdToday, // 今日创建的任务数量
            completionRate // 总体完成率（已完成/总任务数）
        };
    } catch (error) {
        console.error("获取今日概览失败:", error);
        throw new Error("获取今日概览失败，请稍后重试");
    }
}
