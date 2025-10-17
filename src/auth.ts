// auth.config.ts
import NextAuth, { CredentialsSignin, type User } from "next-auth"
import GitHub from "next-auth/providers/github" // example provider
import Credentials from "next-auth/providers/credentials"
import { signInSchema, ZodError } from "@/schema/signInSchema"
import { getUser, addUser } from "@/server/user"

class CustomError extends CredentialsSignin {
    code: string
    constructor(code: string) {
        super(code)
        this.code = code
    }
}

class PasswordError extends CredentialsSignin {
    code = "密码错误，请检查后重试"
}

export const { handlers, auth, signIn, signOut } = NextAuth({
    providers: [
        // GitHub({
        //     clientId: process.env.AUTH_GITHUB_ID!,
        //     clientSecret: process.env.AUTH_GITHUB_SECRET!,
        // }),
        Credentials({
            // You can specify which fields should be submitted, by adding keys to the `credentials` object.
            // e.g. domain, username, password, 2FA token, etc.
            credentials: {
                email: {},
                password: {},
            },
            authorize: async (credentials) => {
                let user, signInResult
                // 这里必须主动拦截一次Zod的Error，再抛一次，login才能完美接住
                try {
                    signInResult = await signInSchema.parseAsync(credentials)
                } catch (error) {
                    if (error instanceof ZodError) {
                        const stringErr = error.issues?.map((item) => item.message).join("，")
                        throw new CustomError(stringErr)
                    }
                    throw new CustomError("验证失败，请检查输入信息")
                }
                const { email, password } = signInResult as { email: string, password: string }

                user = await getUser(email, password)
                if (user === 0) {
                    user = await addUser(email, password)
                } else if (user === 1) {
                    // throw new CustomError("password error")
                    throw new PasswordError()
                }

                return {
                    id: user.userId,
                    userId: user.userId,
                    username: user.username,
                    email,
                    name: user.username?.split("@")[0],
                    image: "https://img1.baidu.com/it/u=4203701946,3255546208&fm=253&app=120&f=JPEG?w=800&h=800"
                }
            },
        }),
    ],
    session: {
        strategy: "jwt", // ✅ use JWT-based sessions
    },
    // 显示回传id
    callbacks: {
        jwt: async ({ token, user }) => {
            if ((user)) {
                token.id = user.id;
                token.userId = (user as any).userId;
                token.username = (user as any).username;
            }
            return token;
        },
        session: async ({ session, token }) => {
            // ✅ 这里才真正写进 Session
            session.user.id = token.id as string;
            (session.user as any).userId = token.userId as string;
            (session.user as any).username = token.username as string;
            return session;
        },
    },
    secret: process.env.AUTH_SECRET, // ✅ must be set in .env
    trustHost: true, // 👈 加上这个
    pages: {
        signIn: "/login",
    },
})

