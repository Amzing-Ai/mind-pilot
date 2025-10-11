// 临时类型定义，等待Prisma客户端更新
export interface TaskCreateInput {
    userId: string;
    content: string;
    expiresAt?: Date;
    priority?: string;
    status?: string;
    startTime?: Date;
    ListId: number;
}

export interface TaskCreateManyInput {
    userId: string;
    content: string;
    expiresAt?: Date;
    priority?: string;
    status?: string;
    startTime?: Date;
    ListId: number;
}
