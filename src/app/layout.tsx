import "@/styles/globals.css";

import { type Metadata } from "next";
// Step1: 添加组件
import ThemeProvider from "@/components/ThemeProvider";
import Menu from "@/components/Menu";
import { Toaster } from "@/components/ui/sonner";
import { SessionProvider } from "next-auth/react";
import { headers } from "next/headers";

export const metadata: Metadata = {
  title: "MindPilot | 智慧笔记",
  description:
    "智慧生活管家，任务清单，任务列表，TODO-List, 小记助手，目标一句话，AI帮你拆解成行动，AI陪伴成长，定期复盘，见证你的每一次进步！，MindPilot，全新一代AI驱动的任务清单与成长辅助系统，重新定义你的每一天！",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") ?? "";

  // 如果是登录页面，不显示菜单
  const isLoginPage = pathname.startsWith("/login");

  return (
    <html lang="zh-CN" suppressHydrationWarning className="h-full">
      <body className="h-full">
        <SessionProvider>
          {/* Step3: 设置 ThemeProvider */}
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem={false}
            disableTransitionOnChange
          >
            {isLoginPage ? (
              children
            ) : (
              <Menu>
                <div className="flex w-full h-full flex-col items-stretch">{children}</div>
              </Menu>
            )}
            <Toaster position="top-center" richColors />
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
