import { db } from './db'

export async function addUser(
    username: string,
    password: string,
): Promise<{ name: string; username: string; userId: string, avatar: string }> {
    const user = await db.user.create({
        data: {
            username,
            password,
            avatar: 'https://avatars.githubusercontent.com/u/61813243?v=4',
            lists: {
                create: [],
            },
        },
    })

    return {
        name: username,
        username,
        avatar: user.avatar ?? 'https://avatars.githubusercontent.com/u/61813243?v=4',
        userId: user.id,
    }
}

/**
 *
 * @param username 用户名
 * @param password 密码
 * @returns 0 = 用户不存在, 1 = 密码错误, 否则用户对象
 */
export async function getUser(
    username: string,
    password: string,
): Promise<
    | 0
    | 1
    | {
        name: string
        username: string
        userId: string
    }
> {
    const user = await db.user.findFirst({
        where: { username },
        include: { lists: true },
    })

    if (!user) return 0
    if (user.password !== password) return 1

    return {
        name: username,
        username,
        userId: user.id,
    }
}