import "@/styles/globals.css";

import { type Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { zhCN } from "@clerk/localizations";
import zhCNlocales from "@/locales/zh.json";
import merge from "lodash.merge";
// Step1: 添加组件
import ThemeProvider from "@/components/ThemeProvider";
import Header from "@/components/Header";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "MindPilot | 智慧笔记",
  description:
    "智慧生活管家，任务清单，任务列表，TODO-List, 小记助手，目标一句话，AI帮你拆解成行动，AI陪伴成长，定期复盘，见证你的每一次进步！，MindPilot，全新一代AI驱动的任务清单与成长辅助系统，重新定义你的每一天！",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const localization = merge(zhCN, zhCNlocales);
  return (
    <ClerkProvider localization={localization}>
      {/* Step2: 设置 suppressHydrationWarning */}
      <html lang="zh-CN" suppressHydrationWarning>
        <body>
          {/* Step3: 设置 ThemeProvider */}
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <Header />
            <div className="flex w-full flex-col items-center">{children}</div>
            <Toaster position="top-center" richColors />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
