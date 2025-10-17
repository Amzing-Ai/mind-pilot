import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

// 获取单个对话详情
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "未授权" }, { status: 401 });
        }

        const { id } = await params;
        const conversation = await prisma.conversation.findFirst({
            where: {
                id: id,
                userId: session.user.id,
            },
        });

        if (!conversation) {
            return NextResponse.json(
                { error: "对话不存在" },
                { status: 404 }
            );
        }

        return NextResponse.json(conversation);
    } catch (error) {
        console.error("获取对话详情失败:", error);
        return NextResponse.json(
            { error: "获取对话详情失败" },
            { status: 500 }
        );
    }
}

// 删除对话
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "未授权" }, { status: 401 });
        }

        const { id } = await params;
        const conversation = await prisma.conversation.findFirst({
            where: {
                id: id,
                userId: session.user.id,
            },
        });

        if (!conversation) {
            return NextResponse.json(
                { error: "对话不存在" },
                { status: 404 }
            );
        }

        await prisma.conversation.delete({
            where: {
                id: id,
            },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("删除对话失败:", error);
        return NextResponse.json(
            { error: "删除对话失败" },
            { status: 500 }
        );
    }
}
