import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

// 获取用户的对话历史
export async function GET(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "未授权" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "10");
        const skip = (page - 1) * limit;

        const conversations = await prisma.conversation.findMany({
            where: {
                userId: session.user.id,
            },
            orderBy: {
                createdAt: "desc",
            },
            skip,
            take: limit,
            select: {
                id: true,
                title: true,
                userInput: true,
                taskCount: true,
                listName: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        const total = await prisma.conversation.count({
            where: {
                userId: session.user.id,
            },
        });

        return NextResponse.json({
            conversations,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error("获取对话历史失败:", error);
        return NextResponse.json(
            { error: "获取对话历史失败" },
            { status: 500 }
        );
    }
}

// 保存新的对话
export async function POST(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "未授权" }, { status: 401 });
        }

        const body = await request.json();
        const { title, userInput, aiResponse, taskCount, listName } = body;

        console.log('收到对话保存请求:', { title, userInput: userInput?.substring(0, 50), aiResponse: aiResponse?.substring(0, 50), taskCount, listName });

        if (!title || !userInput || !aiResponse) {
            console.error('缺少必要字段:', { title: !!title, userInput: !!userInput, aiResponse: !!aiResponse });
            return NextResponse.json(
                { error: "缺少必要字段", details: { title: !!title, userInput: !!userInput, aiResponse: !!aiResponse } },
                { status: 400 }
            );
        }

        const conversation = await prisma.conversation.create({
            data: {
                title,
                userInput,
                aiResponse,
                taskCount,
                listName,
                userId: session.user.id,
            },
        });

        return NextResponse.json(conversation);
    } catch (error) {
        console.error("保存对话失败:", error);
        return NextResponse.json(
            { error: "保存对话失败" },
            { status: 500 }
        );
    }
}
