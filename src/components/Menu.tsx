"use client";

import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bot,
  ListTodo,
  BarChart3,
  Settings,
} from "lucide-react";
import clsx from "clsx";

type MenuItem = {
  key: string;
  name: string;
  href: string;
  icon: React.ElementType;
};

const items: MenuItem[] = [
  { key: "assistant", name: "智慧助手", href: "/chat", icon: Bot },
  { key: "details", name: "任务详情", href: "/", icon: ListTodo },
  { key: "analysis", name: "任务分析", href: "/analysis", icon: BarChart3 },
  { key: "settings", name: "设置", href: "/settings", icon: Settings },
];

export default function Menu({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div className="flex min-h-screen w-full lg:flex-row">
      {/* 左侧边栏：≥lg 显示 */}
      <aside className="hidden lg:flex lg:h-screen lg:w-64 lg:flex-col lg:bg-gradient-to-b lg:from-indigo-600/20 lg:via-blue-600/10 lg:to-purple-600/20 lg:backdrop-blur">
        <div className="flex h-full w-full flex-col gap-3 p-4">
          <div className="px-2 py-1 text-sm font-semibold text-indigo-400">
            智慧任务
          </div>
          <nav className="flex flex-col gap-2">
            {items.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;
              return (
                <motion.button
                  key={item.key}
                  onClick={() => router.push(item.href)}
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  className={clsx(
                    "group relative flex items-center gap-3 rounded-xl px-3 py-2 text-left transition",
                    active
                      ? "text-white"
                      : "text-gray-700 dark:text-gray-200"
                  )}
                >
                  {/* 背景高亮 */}
                  <AnimatePresence>
                    {active && (
                      <motion.span
                        layoutId="menu-active"
                        className="absolute inset-0 -z-10 rounded-xl bg-gradient-to-r from-indigo-500 via-blue-500 to-purple-500 shadow-lg"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}
                  </AnimatePresence>
                  <span
                    className={clsx(
                      "flex h-9 w-9 items-center justify-center rounded-lg",
                      active
                        ? "bg-white/20 text-white"
                        : "bg-gradient-to-br from-indigo-500/10 to-purple-500/10 text-indigo-500 dark:text-indigo-300"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="text-sm font-medium">{item.name}</span>
                </motion.button>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* 右侧内容区 */}
      <main className="flex min-h-screen w-full flex-1 flex-col p-4 pb-20 lg:pb-4">
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </main>

      {/* 底部导航：<lg 显示 */}
      <div className="fixed inset-x-0 bottom-0 z-50 lg:hidden">
        <div className="bg-white/70 p-1 shadow-2xl shadow-indigo-500/20 backdrop-blur dark:bg-gray-900/60">
          <nav className="grid grid-cols-4 gap-1">
            {items.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;
              return (
                <motion.button
                  key={item.key}
                  onClick={() => router.push(item.href)}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  className={clsx(
                    "relative flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs",
                    active
                      ? "text-white"
                      : "text-gray-700 dark:text-gray-200"
                  )}
                >
                  <AnimatePresence>
                    {active && (
                      <motion.span
                        layoutId="menu-active-mobile"
                        className="absolute inset-0 -z-10 rounded-xl bg-gradient-to-r from-indigo-500 via-blue-500 to-purple-500"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}
                  </AnimatePresence>
                  <Icon className="h-5 w-5" />
                  <span className="hidden sm:inline">{item.name}</span>
                </motion.button>
              );
            })}
          </nav>
        </div>
      </div>
    </div>
  );
}


