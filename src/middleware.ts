import { type NextRequest, NextResponse } from "next/server";
import { auth } from "./auth"; // 这里 auth 来自 next-auth v5 的配置文件

export default async function middleware(request: NextRequest) {
    // 🚩 再跑鉴权
    // ② 鉴权逻辑
    // auth() 在 v5 中可作为函数调用，接收 request 返回 session 信息
    const session = await auth();
    // 🚩 调试打印
    console.log("🚀 Session 信息:", JSON.stringify(session, null, 2));
    // 未登录-自动跳转登录
    // if (!session?.user) {
    //     return NextResponse.redirect(new URL("/api/auth/signin?callbackUrl=" + request.url, request.url));
    // }

    //   // 例如：拦截 /admin 目录
    // 例如：仅限制 /admin 路由
    //   if (request.nextUrl.pathname.startsWith("/admin")) {
    //     if (!session?.user) {
    //       return NextResponse.redirect(new URL("/unauthorized", request.url));
    //     }
    //   }


    return NextResponse.next();
}

// 2. 匹配规则：排除 api、静态资源
export const config = {
    matcher: ["/((?!api|trpc|_next|_vercel|.*\\..*).*)"],
};