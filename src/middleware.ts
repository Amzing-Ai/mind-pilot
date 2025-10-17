import { type NextRequest, NextResponse } from "next/server";
import { auth } from "./auth"; // 这里 auth 来自 next-auth v5 的配置文件

export default async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // 排除不需要认证的路径
    if (pathname.startsWith('/login') ||
        pathname.startsWith('/api') ||
        pathname.startsWith('/_next') ||
        pathname.startsWith('/favicon.ico')) {
        const response = NextResponse.next();
        response.headers.set("x-pathname", pathname);
        return response;
    }

    // 🚩 再跑鉴权
    // ② 鉴权逻辑
    // auth() 在 v5 中可作为函数调用，接收 request 返回 session 信息
    const session = await auth();
    // 🚩 调试打印
    console.log("🚀 Session 信息:", JSON.stringify(session, null, 2));
    // 未登录-自动跳转登录
    if (!session?.user) {
        const redirectResponse = NextResponse.redirect(new URL("/login?callbackUrl=" + encodeURIComponent(request.url), request.url));
        redirectResponse.headers.set("x-pathname", pathname);
        return redirectResponse;
    }

    // 设置 pathname header 供 layout 使用
    const response = NextResponse.next();
    response.headers.set("x-pathname", pathname);

    //   // 例如：拦截 /admin 目录
    // 例如：仅限制 /admin 路由
    //   if (request.nextUrl.pathname.startsWith("/admin")) {
    //     if (!session?.user) {
    //       return NextResponse.redirect(new URL("/unauthorized", request.url));
    //     }
    //   }

    return response;
}

// 2. 匹配规则：排除 api、静态资源
export const config = {
    matcher: ["/((?!api|trpc|_next|_vercel|.*\\..*).*)"],
};